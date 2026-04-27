/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  // Only send email if status is 'pending_invite'
  if (e.record.get("status") !== "pending_invite") {
    e.next();
    return;
  }

  const projectId = e.record.get("projectId");
  const email = e.record.get("email");
  const role = e.record.get("role");
  const inviteToken = e.record.get("inviteToken");
  const createdBy = e.record.get("createdBy");

  // Fetch project details
  let projectName = "Project";
  try {
    const project = $app.findRecordById("projects", projectId);
    if (project) {
      projectName = project.get("name") || "Project";
    }
  } catch (err) {
    console.log("Could not fetch project: " + err.message);
  }

  // Fetch coordinator details
  let coordinatorName = "Coordinator";
  try {
    const coordinator = $app.findRecordById("users", createdBy);
    if (coordinator) {
      coordinatorName = coordinator.get("full_name") || coordinator.get("name") || "Coordinator";
    }
  } catch (err) {
    console.log("Could not fetch coordinator: " + err.message);
  }

  // Build invite link
  const baseUrl = "https://trackmyscaffolding.com";
  const inviteLink = inviteToken
    ? baseUrl + "/join?token=" + inviteToken
    : baseUrl + "/join";

  // Build email HTML
  const emailHtml =
    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
    "<h2 style='color: #1E3A5F;'>You're invited to join " + projectName + "</h2>" +
    "<p>Hello,</p>" +
    "<p><strong>" + coordinatorName + "</strong> has invited you to join the project <strong>" + projectName + "</strong> on TrackMyScaffolding.</p>" +
    "<p><strong>Your Role:</strong> " + role + "</p>" +
    "<p style='margin: 30px 0;'>" +
    "<a href='" + inviteLink + "' style='background-color: #1E3A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;'>Accept Invitation</a>" +
    "</p>" +
    "<p style='color: #666; font-size: 14px;'>Or copy this link: " + inviteLink + "</p>" +
    "<p style='color: #666; font-size: 12px; margin-top: 30px;'>If you have any questions, contact " + coordinatorName + ".</p>" +
    "</div>";

  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: $app.settings().meta.senderName
    },
    to: [{ address: email }],
    subject: "You're invited to join " + projectName + " on TrackMyScaffolding",
    html: emailHtml
  });

  try {
    $app.newMailClient().send(message);
    console.log("Invite email sent to: " + email);
  } catch (err) {
    console.log("Failed to send invite email: " + err.message);
  }

  e.next();
}, "subcontractors");
