/// <reference path="../pb_data/types.d.ts" />

// Run every hour to check risk scores
cronAdd("checkRiskScores", "0 * * * *", () => {
    const projects = $app.dao().findRecordsByFilter("projects", "status = 'active'");

    projects.forEach(project => {
        try {
            const projectId = project.id;
            const now = new Date();
            
            // 1. Pending Requests > 48h
            const cutoff48h = new Date(now.getTime() - (48 * 60 * 60 * 1000)).toISOString().replace('T', ' ');
            const pendingReqs = $app.dao().findRecordsByFilter("scaffold_requests", 
                `projectId = "${projectId}" && status = "Pending" && created < "${cutoff48h}"`
            );

            // 2. Missing Diary Entries (last 7 days)
            const last7Days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const day = d.getDay();
                if (day !== 0 && day !== 6) { // Weekdays only
                    last7Days.push(d.toISOString().split('T')[0]);
                }
            }

            const recentDiaries = $app.dao().findRecordsByFilter("diary_entries", 
                `project_id = "${projectId}" && date >= "${last7Days[last7Days.length - 1]}"`
            );
            
            const diaryDates = new Set(recentDiaries.map(e => e.get("date").split(' ')[0]));
            const missingDays = last7Days.filter(d => !diaryDates.has(d)).length;

            // 3. Active Alerts
            const alerts = $app.dao().findRecordsByFilter("alerts", 
                `project_id = "${projectId}" && is_read = false`
            );

            // Calculate Score
            const score = 100
                - (pendingReqs.length * 10)
                - (missingDays * 5)
                - (alerts.length * 8);
            
            const finalScore = Math.max(0, Math.min(100, score));

            // If score is critical (< 30), send notification
            if (finalScore < 30) {
                sendRiskAlert(project, finalScore, pendingReqs.length, missingDays, alerts.length);
            }
        } catch (err) {
            console.log("Error checking risk score for project " + project.id + ": " + err.message);
        }
    });
});

function sendRiskAlert(project, score, pending, missing, alerts) {
    // Check if we already sent a notification in the last 24h to avoid spam
    const lastNotifKey = "last_risk_alert_" + project.id;
    // Note: PocketBase hooks don't have a simple KV store, but we can check email_logs
    const recentLogs = $app.dao().findRecordsByFilter("email_logs", 
        `subject ~ "CRITICAL RISK ALERT" && created > "${new Date(Date.now() - 24*60*60*1000).toISOString().replace('T', ' ')}"`
    );
    
    if (recentLogs.length > 0) {
        return; // Already notified recently
    }

    // Get project owner (coordinator)
    let ownerEmail = "";
    try {
        const ownerId = project.get("createdBy") || project.get("owner");
        if (ownerId) {
            const owner = $app.dao().findRecordById("users", ownerId);
            ownerEmail = owner.get("email");
        }
    } catch (e) {}

    if (!ownerEmail) return;

    const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">CRITICAL RISK ALERT</h1>
            </div>
            <div style="padding: 20px; color: #1f2937;">
                <p>Hello,</p>
                <p>The safety and compliance score for project <strong>${project.get("name")}</strong> has fallen to a critical level.</p>
                
                <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center;">
                    <span style="font-size: 48px; font-weight: bold; color: #ef4444;">${score}</span>
                    <p style="margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #991b1b;">Current Risk Score</p>
                </div>

                <h3>Identified Issues:</h3>
                <ul>
                    <li><strong>${pending}</strong> Pending Requests > 48h (-${pending * 10} pts)</li>
                    <li><strong>${missing}</strong> Missing Site Diary entries (-${missing * 5} pts)</li>
                    <li><strong>${alerts}</strong> Active Safety Alerts (-${alerts * 8} pts)</li>
                </ul>

                <p style="margin-top: 20px;">Please log in to the Dashboard immediately to address these issues and restore site compliance.</p>
                
                <a href="https://trackmyscaffolding.com/dashboard" style="display: block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; text-align: center; font-weight: bold; margin: 30px 0;">Open Dashboard</a>
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                TrackMyScaffolding AI Automated Safety Monitor
            </div>
        </div>
    `;

    const message = new MailerMessage({
        from: {
            address: $app.settings().meta.senderAddress,
            name: $app.settings().meta.senderName
        },
        to: [{ address: ownerEmail }],
        subject: "[CRITICAL] Risk Score Alert: " + project.get("name") + " (" + score + "/100)",
        html: emailHtml
    });

    try {
        $app.newMailClient().send(message);
        
        // Log to email_logs
        const collection = $app.dao().findCollectionByNameOrId("email_logs");
        const record = new Record(collection);
        record.set("recipient", ownerEmail);
        record.set("subject", "[CRITICAL] Risk Score Alert: " + project.get("name"));
        record.set("status", "sent");
        record.set("timestamp", new Date().toISOString());
        $app.dao().saveRecord(record);

    } catch (err) {
        console.log("Failed to send risk alert email: " + err.message);
    }
}
