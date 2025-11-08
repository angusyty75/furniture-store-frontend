// Complete UserAPI.java with the update profile method
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
                phone == null || phone.trim().isEmpty() ||
                address == null || address.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity("{\"error\": \"Missing required fields\"}")
                             .build();
            }
            
            User newUser = new User(username, email, firstName, lastName, phone, address);
            User createdUser = userDAO.createUser(newUser, password);
            
            // Remove sensitive information
            createdUser.setId(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("user", createdUser);
            
            return Response.status(Response.Status.CREATED)
                         .entity(response)
                         .build();
            
        } catch (SQLException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity("{\"error\": \"Registration failed\"}")
                         .build();
        }
    }
    
    @POST
    @Path("/login")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response login(@FormParam("username") String username,
                         @FormParam("password") String password) {
        try {
            User user = userDAO.authenticateUser(username, password);
            
            if (user != null) {
                String token = SecurityUtil.generateToken(username);
                
                Map<String, Object> response = new HashMap<>();
                response.put("token", token);
                response.put("user", user);
                
                return Response.ok(response).build();
            } else {
                return Response.status(Response.Status.UNAUTHORIZED)
                             .entity("{\"error\": \"Invalid credentials\"}")
                             .build();
            }
        } catch (SQLException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity("{\"error\": \"Login failed\"}")
                         .build();
        }
    }
    
    @GET
    @Path("/profile")
    @SecureEndpoint
    public Response getProfile(@HeaderParam("Authorization") String authHeader) {
        try {
            String token = authHeader.substring("Bearer".length()).trim();
            String username = SecurityUtil.getUsernameFromToken(token);
            
            User user = userDAO.getUserByUsername(username);
            
            if (user != null) {
                return Response.ok(user).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND)
                             .entity("{\"error\": \"User not found\"}")
                             .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity("{\"error\": \"Failed to get profile\"}")
                         .build();
        }
    }
    
    // NEW: Update profile method
    @PUT
    @Path("/profile")
    @SecureEndpoint
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response updateProfile(@HeaderParam("Authorization") String authHeader,
                                 @FormParam("firstName") String firstName,
                                 @FormParam("lastName") String lastName,
                                 @FormParam("email") String email,
                                 @FormParam("phone") String phone,
                                 @FormParam("address") String address) {
        try {
            String token = authHeader.substring("Bearer".length()).trim();
            String username = SecurityUtil.getUsernameFromToken(token);
            
            // Get current user by username
            User currentUser = userDAO.getUserByUsername(username);
            if (currentUser == null) {
                return Response.status(Response.Status.NOT_FOUND)
                             .entity("{\"error\": \"User not found\"}")
                             .build();
            }
            
            // Input validation
            if (firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                phone == null || phone.trim().isEmpty() ||
                address == null || address.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                             .entity("{\"error\": \"Missing required fields\"}")
                             .build();
            }
            
            // Update user object with new data
            currentUser.setFirstName(firstName.trim());
            currentUser.setLastName(lastName.trim());
            currentUser.setEmail(email.trim());
            currentUser.setPhone(phone.trim());
            currentUser.setAddress(address.trim());
            
            // Update user in database
            User updatedUser = userDAO.updateUser(currentUser);
            
            // Remove sensitive information
            updatedUser.setId(null); // Don't expose internal ID
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("user", updatedUser);
            
            return Response.ok(response).build();
            
        } catch (SQLException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                         .entity("{\"error\": \"Failed to update profile: " + e.getMessage() + "\"}")
                         .build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                         .entity("{\"error\": \"Invalid request: " + e.getMessage() + "\"}")
                         .build();
        }
    }
}