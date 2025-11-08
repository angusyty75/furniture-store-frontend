// Complete UserAPI.java with working updateProfile method
package com.furniture.api;

import com.furniture.dao.UserDAO;
import com.furniture.model.User;
import com.furniture.util.SecurityUtil;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import com.furniture.filter.SecureEndpoint;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserAPI {
    
    private UserDAO userDAO = new UserDAO();
    
    @POST
    @Path("/register")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response registerUser(@FormParam("username") String username,
                                @FormParam("email") String email,
                                @FormParam("password") String password,
                                @FormParam("firstName") String firstName,
                                @FormParam("lastName") String lastName,
                                @FormParam("phone") String phone,
                                @FormParam("address") String address) {
        try {
            // Input validation
            if (username == null || username.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                password == null || password.trim().isEmpty() ||
                firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                phone == null || phone.trim().isEmpty() ||
                address == null || address.trim().isEmpty()) {
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Missing required fields");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            // Check if user already exists
            User existingUser = userDAO.getUserByUsername(username);
            if (existingUser != null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username already exists");
                return Response.status(Response.Status.CONFLICT)
                             .entity(errorResponse)
                             .build();
            }
            
            User newUser = new User();
            newUser.setUsername(username.trim());
            newUser.setEmail(email.trim());
            newUser.setFirstName(firstName.trim());
            newUser.setLastName(lastName.trim());
            newUser.setPhone(phone.trim());
            newUser.setAddress(address.trim());
            
            User createdUser = userDAO.createUser(newUser, password);
            
            // Remove sensitive information
            createdUser.setId(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", createdUser);
            
            return Response.status(Response.Status.CREATED)
                         .entity(response)
                         .build();
            
        } catch (SQLException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Registration failed: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                         .entity(errorResponse)
                         .build();
        }
    }
    
    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response login(@FormParam("username") String username,
                         @FormParam("password") String password) {
        try {
            // Input validation
            if (username == null || username.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
                
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username and password are required");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            User user = userDAO.authenticateUser(username.trim(), password);
            
            if (user != null) {
                String token = SecurityUtil.generateToken(username);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("token", token);
                response.put("user", user);
                
                return Response.ok(response).build();
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid credentials");
                return Response.status(Response.Status.UNAUTHORIZED)
                             .entity(errorResponse)
                             .build();
            }
        } catch (SQLException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Login failed: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request: " + e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                         .entity(errorResponse)
                         .build();
        }
    }
    
    @GET
    @Path("/profile")
    @SecureEndpoint
    public Response getProfile(@HeaderParam("Authorization") String authHeader) {
        try {
            // Validate authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid authorization header");
                return Response.status(Response.Status.UNAUTHORIZED)
                             .entity(errorResponse)
                             .build();
            }
            
            String token = authHeader.substring("Bearer ".length()).trim();
            String username = SecurityUtil.getUsernameFromToken(token);
            
            if (username == null || username.trim().isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid token");
                return Response.status(Response.Status.UNAUTHORIZED)
                             .entity(errorResponse)
                             .build();
            }
            
            User user = userDAO.getUserByUsername(username);
            
            if (user != null) {
                // Remove sensitive information
                user.setId(null);
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("user", user);
                
                return Response.ok(response).build();
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return Response.status(Response.Status.NOT_FOUND)
                             .entity(errorResponse)
                             .build();
            }
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get profile: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        }
    }
    
    /**
     * Update user profile
     * 
     * @param authHeader JWT authorization header (Bearer token)
     * @param firstName User's first name
     * @param lastName User's last name
     * @param email User's email address
     * @param phone User's phone number
     * @param address User's address
     * @return Response with updated user profile or error message
     */
    @PUT
    @Path("/profile")
    @SecureEndpoint
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateProfile(@HeaderParam("Authorization") String authHeader,
                                 @FormParam("firstName") String firstName,
                                 @FormParam("lastName") String lastName,
                                 @FormParam("email") String email,
                                 @FormParam("phone") String phone,
                                 @FormParam("address") String address) {
        
        System.out.println("=== UPDATE PROFILE REQUEST ===");
        System.out.println("Authorization: " + (authHeader != null ? "Bearer ***" : "null"));
        System.out.println("firstName: " + firstName);
        System.out.println("lastName: " + lastName);
        System.out.println("email: " + email);
        System.out.println("phone: " + phone);
        System.out.println("address: " + address);
        
        try {
            // 1. Validate authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("ERROR: Invalid authorization header");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid authorization header");
                return Response.status(Response.Status.UNAUTHORIZED)
                             .entity(errorResponse)
                             .build();
            }
            
            // 2. Extract and validate token
            String token = authHeader.substring("Bearer ".length()).trim();
            String username = SecurityUtil.getUsernameFromToken(token);
            
            if (username == null || username.trim().isEmpty()) {
                System.out.println("ERROR: Invalid token or username");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid token");
                return Response.status(Response.Status.UNAUTHORIZED)
                             .entity(errorResponse)
                             .build();
            }
            
            System.out.println("Authenticated user: " + username);
            
            // 3. Get current user from database
            User currentUser = userDAO.getUserByUsername(username);
            if (currentUser == null) {
                System.out.println("ERROR: User not found in database: " + username);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found");
                return Response.status(Response.Status.NOT_FOUND)
                             .entity(errorResponse)
                             .build();
            }
            
            System.out.println("Current user found: " + currentUser.getUsername());
            
            // 4. Input validation
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                phone == null || phone.trim().isEmpty() ||
                address == null || address.trim().isEmpty()) {
                
                System.out.println("ERROR: Missing required fields");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "All fields are required (firstName, lastName, email, phone, address)");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            // 5. Email validation (basic)
            if (!email.contains("@") || !email.contains(".")) {
                System.out.println("ERROR: Invalid email format: " + email);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid email format");
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity(errorResponse)
                             .build();
            }
            
            // 6. Check if email is already used by another user
            User existingUserWithEmail = userDAO.getUserByEmail(email.trim());
            if (existingUserWithEmail != null && !existingUserWithEmail.getUsername().equals(username)) {
                System.out.println("ERROR: Email already in use by another user");
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Email is already in use by another account");
                return Response.status(Response.Status.CONFLICT)
                             .entity(errorResponse)
                             .build();
            }
            
            // 7. Update user object with new data
            System.out.println("Updating user data...");
            currentUser.setFirstName(firstName.trim());
            currentUser.setLastName(lastName.trim());
            currentUser.setEmail(email.trim());
            currentUser.setPhone(phone.trim());
            currentUser.setAddress(address.trim());
            
            // 8. Save changes to database
            System.out.println("Saving to database...");
            User updatedUser = userDAO.updateUser(currentUser);
            
            // 9. Remove sensitive information from response
            updatedUser.setId(null); // Don't expose internal ID
            
            System.out.println("User profile updated successfully!");
            
            // 10. Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);
            
            return Response.ok(response).build();
            
        } catch (SQLException e) {
            System.out.println("DATABASE ERROR: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Database error: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        } catch (Exception e) {
            System.out.println("GENERAL ERROR: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Update failed: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity(errorResponse)
                         .build();
        }
    }
}