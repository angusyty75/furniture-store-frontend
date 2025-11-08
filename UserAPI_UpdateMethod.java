// Add this method to your existing UserAPI.java file

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