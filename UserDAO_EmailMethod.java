// Additional method to add to UserDAO.java for email validation

/**
 * Get user by email address
 * Used for checking if email is already in use during profile updates
 * 
 * @param email Email address to search for
 * @return User object if found, null if not found
 * @throws SQLException if database error occurs
 */
public User getUserByEmail(String email) throws SQLException {
    String sql = "SELECT * FROM users WHERE email = ? AND is_active = TRUE";
    
    try (Connection conn = DatabaseConfig.getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {
        
        stmt.setString(1, email);
        ResultSet rs = stmt.executeQuery();
        
        if (rs.next()) {
            return extractUserFromResultSet(rs);
        }
        return null;
    }
}