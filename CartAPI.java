// Complete CartAPI.java with proper getUserIdFromUsername implementation
package com.furniture.api;

import com.furniture.filter.SecureEndpoint;
import com.furniture.dao.CartDAO;
import com.furniture.dao.UserDAO;
import com.furniture.model.Cart;
import com.furniture.model.CartItem;
import com.furniture.model.User;
import com.furniture.util.SecurityUtil;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import java.util.logging.Logger;
import java.util.logging.Level;
import java.util.logging.FileHandler;
import java.util.logging.SimpleFormatter;
import java.io.IOException;

@Path("/cart")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CartAPI {

    private CartDAO cartDAO = new CartDAO();
    private UserDAO userDAO = new UserDAO(); // Add UserDAO instance
    private static final Logger logger = Logger.getLogger(CartAPI.class.getName());

    // Static block to configure logger
    static {
        try {
            // Create file handler that writes to logs/cart-api.log
            FileHandler fileHandler = new FileHandler("logs/cart-api.log", true);
            fileHandler.setFormatter(new SimpleFormatter());
            logger.addHandler(fileHandler);
            logger.setLevel(Level.ALL);
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @GET
    @SecureEndpoint
    public Response getCart(@HeaderParam("Authorization") String authHeader) {
        try {
            String token = authHeader.substring("Bearer".length()).trim();
            String username = SecurityUtil.getUsernameFromToken(token);
            logger.info("Extracted username from token: " + username);

            // Get user ID from database using proper UserDAO method
            Long userId = getUserIdFromUsername(username);
            if (userId == null) {
                logger.warning("User not found for username: " + username);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\": \"User not found\"}")
                        .build();
            }
            
            logger.info("Mapped username to userId: " + userId);

            Cart cart = cartDAO.getCartByUserId(userId);
            logger.info("Retrieved cart from database: cartId=" + (cart != null ? cart.getId() : "null"));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cart", cart);

            logger.info("Cart retrieval successful for userId: " + userId);
            return Response.ok(response).build();

        } catch (SQLException e) {
            logger.log(Level.SEVERE, "Database error in getCart for authHeader: " +
                    (authHeader != null ? authHeader.substring(0, 20) + "..." : "null"), e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Failed to retrieve cart: " + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error in getCart", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Invalid request: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @POST
    @Path("/items")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @SecureEndpoint
    public Response addToCart(@HeaderParam("Authorization") String authHeader,
                              @FormParam("productId") Long productId,
                              @FormParam("quantity") @DefaultValue("1") int quantity) {
        try {
            logger.info("=== ADD TO CART REQUEST ===");
            logger.info("productId: " + productId);
            logger.info("quantity: " + quantity);
            
            String token = authHeader.substring("Bearer".length()).trim();
            String username = SecurityUtil.getUsernameFromToken(token);
            logger.info("username: " + username);
            
            // Get user ID from database using proper UserDAO method
            Long userId = getUserIdFromUsername(username);
            if (userId == null) {
                logger.warning("User not found for username: " + username);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\": \"User not found\"}")
                        .build();
            }
            
            logger.info("userId: " + userId);

            Cart cart = cartDAO.getCartByUserId(userId);
            logger.info("cart retrieved: " + (cart != null ? "cartId=" + cart.getId() : "null"));
            
            CartItem item = cartDAO.addItemToCart(cart.getId(), productId, quantity);
            logger.info("item added: " + (item != null ? "itemId=" + item.getId() : "null"));

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item added to cart");
            response.put("item", item);

            logger.info("Add to cart successful");
            return Response.ok(response).build();

        } catch (SQLException e) {
            logger.log(Level.SEVERE, "Database error in addToCart", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Failed to add item to cart: " + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error in addToCart", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Invalid request: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @PUT
    @Path("/items/{itemId}")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @SecureEndpoint
    public Response updateCartItem(@HeaderParam("Authorization") String authHeader,
                                   @PathParam("itemId") Long itemId,
                                   @FormParam("quantity") int quantity) {
        try {
            logger.info("=== UPDATE CART ITEM REQUEST ===");
            logger.info("itemId: " + itemId);
            logger.info("quantity: " + quantity);
            
            if (quantity <= 0) {
                cartDAO.removeItemFromCart(itemId);
                logger.info("Item removed due to quantity <= 0");

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Item removed from cart");
                return Response.ok(response).build();
            }

            CartItem item = cartDAO.updateCartItemQuantity(itemId, quantity);
            logger.info("Item quantity updated successfully");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cart item updated");
            response.put("item", item);

            return Response.ok(response).build();

        } catch (SQLException e) {
            logger.log(Level.SEVERE, "Database error in updateCartItem", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Failed to update cart item: " + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error in updateCartItem", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Invalid request: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @DELETE
    @Path("/items/{itemId}")
    @SecureEndpoint
    public Response removeCartItem(@HeaderParam("Authorization") String authHeader,
                                   @PathParam("itemId") Long itemId) {
        try {
            logger.info("=== REMOVE CART ITEM REQUEST ===");
            logger.info("itemId: " + itemId);
            
            cartDAO.removeItemFromCart(itemId);
            logger.info("Item removed successfully");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Item removed from cart");

            return Response.ok(response).build();

        } catch (SQLException e) {
            logger.log(Level.SEVERE, "Database error in removeCartItem", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Failed to remove item from cart: " + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error in removeCartItem", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Invalid request: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    @DELETE
    @Path("/clear")
    @SecureEndpoint
    public Response clearCart(@HeaderParam("Authorization") String authHeader) {
        try {
            logger.info("=== CLEAR CART REQUEST ===");
            
            String token = authHeader.substring("Bearer".length()).trim();
            String username = SecurityUtil.getUsernameFromToken(token);
            logger.info("username: " + username);
            
            // Get user ID from database using proper UserDAO method
            Long userId = getUserIdFromUsername(username);
            if (userId == null) {
                logger.warning("User not found for username: " + username);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("{\"error\": \"User not found\"}")
                        .build();
            }
            
            logger.info("userId: " + userId);

            Cart cart = cartDAO.getCartByUserId(userId);
            cartDAO.clearCart(cart.getId());
            logger.info("Cart cleared successfully");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cart cleared");

            return Response.ok(response).build();

        } catch (SQLException e) {
            logger.log(Level.SEVERE, "Database error in clearCart", e);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Failed to clear cart: " + e.getMessage() + "\"}")
                    .build();
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error in clearCart", e);
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Invalid request: " + e.getMessage() + "\"}")
                    .build();
        }
    }

    /**
     * Get user ID from username using database lookup
     * Replaces the hardcoded mock implementation with proper database query
     * 
     * @param username The username to look up
     * @return User ID if found, null if not found
     */
    private Long getUserIdFromUsername(String username) {
        try {
            logger.info("=== GET USER ID FROM USERNAME ===");
            logger.info("Looking up username: " + username);
            
            if (username == null || username.trim().isEmpty()) {
                logger.warning("Username is null or empty");
                return null;
            }
            
            // Use UserDAO to get user by username
            User user = userDAO.getUserByUsername(username.trim());
            
            if (user != null) {
                Long userId = user.getId();
                logger.info("Found user: username=" + username + ", userId=" + userId);
                return userId;
            } else {
                logger.warning("User not found in database: " + username);
                return null;
            }
            
        } catch (SQLException e) {
            logger.log(Level.SEVERE, "Database error while looking up user: " + username, e);
            return null;
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Unexpected error while looking up user: " + username, e);
            return null;
        }
    }
}