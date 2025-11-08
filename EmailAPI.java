// Backend Email API - EmailAPI.java
// Add this to your backend Java project

package com.furniture.api;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;

@Path("/email")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class EmailAPI {
    
    // Email configuration - you should move these to environment variables
    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final String SMTP_PORT = "587";
    private static final String EMAIL_USERNAME = "your-sender-email@gmail.com"; // Replace with your sending email
    private static final String EMAIL_PASSWORD = "your-app-password"; // Replace with your Gmail App Password
    private static final String RECIPIENT_EMAIL = "angusyty175@gmail.com";
    
    @POST
    @Path("/send-contact")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response sendContactEmail(@FormParam("name") String name,
                                   @FormParam("email") String email,
                                   @FormParam("subject") String subject,
                                   @FormParam("message") String message) {
        try {
            // Input validation
            if (name == null || name.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                subject == null || subject.trim().isEmpty() ||
                message == null || message.trim().isEmpty()) {
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "All fields are required");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            // Email validation (basic)
            if (!email.contains("@") || !email.contains(".")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid email format");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            // Send email
            boolean emailSent = sendEmail(name.trim(), email.trim(), subject.trim(), message.trim());
            
            if (emailSent) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Email sent successfully");
                
                return Response.ok(response).build();
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Failed to send email");
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                             .entity(errorResponse)
                             .build();
            }
            
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to send email: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        }
    }
    
    private boolean sendEmail(String name, String email, String subject, String message) {
        try {
            System.out.println("=== SENDING EMAIL ===");
            System.out.println("From: " + name + " <" + email + ">");
            System.out.println("Subject: " + subject);
            System.out.println("Message: " + message);
            
            // Setup mail server properties
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", SMTP_HOST);
            props.put("mail.smtp.port", SMTP_PORT);
            props.put("mail.smtp.ssl.trust", SMTP_HOST);
            
            // Create session with authentication
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(EMAIL_USERNAME, EMAIL_PASSWORD);
                }
            });
            
            // Create message
            Message msg = new MimeMessage(session);
            msg.setFrom(new InternetAddress(EMAIL_USERNAME));
            msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(RECIPIENT_EMAIL));
            msg.setSubject("Contact Form: " + subject);
            
            // Create email body
            String emailBody = String.format(
                "New contact form submission:\n\n" +
                "Name: %s\n" +
                "Email: %s\n" +
                "Subject: %s\n\n" +
                "Message:\n%s\n\n" +
                "---\n" +
                "This message was sent from the Furniture Store contact form.",
                name, email, subject, message
            );
            
            msg.setText(emailBody);
            msg.setReplyTo(InternetAddress.parse(email)); // Set reply-to to customer's email
            
            // Send message
            Transport.send(msg);
            
            System.out.println("Email sent successfully to: " + RECIPIENT_EMAIL);
            return true;
            
        } catch (MessagingException e) {
            System.err.println("MessagingException: " + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("General exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}