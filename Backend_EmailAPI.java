// Backend_EmailAPI.java
// Complete Email API for sending contact form emails to angusyty175@gmail.com

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
    
    // Email configuration - Replace these with your actual values
    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final String SMTP_PORT = "587";
    private static final String EMAIL_USERNAME = "your-sender-email@gmail.com"; // Replace with your sending Gmail
    private static final String EMAIL_PASSWORD = "your-gmail-app-password";     // Replace with Gmail App Password
    private static final String RECIPIENT_EMAIL = "angusyty175@gmail.com";      // This stays as is
    
    /**
     * Send contact form email
     * POST /email/send-contact
     * 
     * @param name Customer's name
     * @param email Customer's email
     * @param subject Email subject
     * @param message Email message
     * @return Response with success/error status
     */
    @POST
    @Path("/send-contact")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response sendContactEmail(@FormParam("name") String name,
                                   @FormParam("email") String email,
                                   @FormParam("subject") String subject,
                                   @FormParam("message") String message) {
        
        System.out.println("=== CONTACT FORM EMAIL REQUEST ===");
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Subject: " + subject);
        System.out.println("Message: " + message);
        
        try {
            // Input validation
            if (name == null || name.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                subject == null || subject.trim().isEmpty() ||
                message == null || message.trim().isEmpty()) {
                
                System.out.println("ERROR: Missing required fields");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "All fields are required");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            // Email validation (basic)
            if (!email.contains("@") || !email.contains(".")) {
                System.out.println("ERROR: Invalid email format: " + email);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid email format");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            // Send email
            System.out.println("Attempting to send email...");
            boolean emailSent = sendEmail(name.trim(), email.trim(), subject.trim(), message.trim());
            
            if (emailSent) {
                System.out.println("Email sent successfully!");
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Email sent successfully");
                
                return Response.ok(response).build();
            } else {
                System.out.println("Failed to send email");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Failed to send email");
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                             .entity(errorResponse)
                             .build();
            }
            
        } catch (Exception e) {
            System.err.println("ERROR in sendContactEmail: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to send email: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        }
    }
    
    /**
     * Actually send the email using JavaMail
     * 
     * @param name Customer name
     * @param email Customer email
     * @param subject Email subject
     * @param message Email message
     * @return true if sent successfully, false otherwise
     */
    private boolean sendEmail(String name, String email, String subject, String message) {
        try {
            System.out.println("=== SENDING EMAIL VIA SMTP ===");
            System.out.println("SMTP Host: " + SMTP_HOST);
            System.out.println("SMTP Port: " + SMTP_PORT);
            System.out.println("From: " + EMAIL_USERNAME);
            System.out.println("To: " + RECIPIENT_EMAIL);
            System.out.println("Reply-To: " + email);
            
            // Setup mail server properties
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", SMTP_HOST);
            props.put("mail.smtp.port", SMTP_PORT);
            props.put("mail.smtp.ssl.trust", SMTP_HOST);
            props.put("mail.debug", "true"); // Enable debug for troubleshooting
            
            System.out.println("SMTP Properties configured");
            
            // Create session with authentication
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    System.out.println("Authenticating with username: " + EMAIL_USERNAME);
                    return new PasswordAuthentication(EMAIL_USERNAME, EMAIL_PASSWORD);
                }
            });
            
            System.out.println("Mail session created");
            
            // Create message
            Message msg = new MimeMessage(session);
            msg.setFrom(new InternetAddress(EMAIL_USERNAME, "Furniture Store Contact Form"));
            msg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(RECIPIENT_EMAIL));
            msg.setSubject("Contact Form: " + subject);
            
            // Set reply-to to customer's email so you can reply directly
            msg.setReplyTo(InternetAddress.parse(email));
            
            // Create email body with proper formatting
            String emailBody = createEmailBody(name, email, subject, message);
            msg.setText(emailBody);
            
            System.out.println("Message created, attempting to send...");
            
            // Send message
            Transport.send(msg);
            
            System.out.println("✅ Email sent successfully to: " + RECIPIENT_EMAIL);
            return true;
            
        } catch (MessagingException e) {
            System.err.println("❌ MessagingException: " + e.getMessage());
            e.printStackTrace();
            return false;
        } catch (Exception e) {
            System.err.println("❌ General exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
    
    /**
     * Create formatted email body
     * 
     * @param name Customer name
     * @param email Customer email  
     * @param subject Email subject
     * @param message Email message
     * @return Formatted email body
     */
    private String createEmailBody(String name, String email, String subject, String message) {
        StringBuilder body = new StringBuilder();
        
        body.append("📧 New Contact Form Submission\n");
        body.append("=====================================\n\n");
        
        body.append("Customer Details:\n");
        body.append("• Name: ").append(name).append("\n");
        body.append("• Email: ").append(email).append("\n");
        body.append("• Subject: ").append(subject).append("\n\n");
        
        body.append("Message:\n");
        body.append("─────────────────────────────────────\n");
        body.append(message).append("\n");
        body.append("─────────────────────────────────────\n\n");
        
        body.append("📝 Additional Information:\n");
        body.append("• Submitted: ").append(new java.util.Date()).append("\n");
        body.append("• Source: Furniture Store Website Contact Form\n");
        body.append("• Reply directly to this email to respond to the customer\n\n");
        
        body.append("---\n");
        body.append("This message was automatically generated by the Furniture Store contact form.\n");
        body.append("Website: http://localhost:5174\n");
        
        return body.toString();
    }
    
    /**
     * Test endpoint to verify email configuration
     * GET /email/test
     */
    @GET
    @Path("/test")
    public Response testEmailConfiguration() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("smtp_host", SMTP_HOST);
            response.put("smtp_port", SMTP_PORT);
            response.put("username_configured", EMAIL_USERNAME != null && !EMAIL_USERNAME.equals("your-sender-email@gmail.com"));
            response.put("password_configured", EMAIL_PASSWORD != null && !EMAIL_PASSWORD.equals("your-gmail-app-password"));
            response.put("recipient", RECIPIENT_EMAIL);
            response.put("status", "Email configuration loaded");
            
            return Response.ok(response).build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Configuration error: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        }
    }
}