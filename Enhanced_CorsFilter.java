// Enhanced CORS Filter for your J2EE application
// Save this as: C:\Project\java\furniture-store\src\main\java\com\furniture\filter\CorsFilter.java

package com.furniture.filter;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.ext.Provider;
import java.io.IOException;
import java.util.logging.Logger;

@Provider
public class CorsFilter implements ContainerResponseFilter {
    
    private static final Logger logger = Logger.getLogger(CorsFilter.class.getName());

    @Override
    public void filter(ContainerRequestContext requestContext,
                       ContainerResponseContext responseContext) throws IOException {
        
        // Log the request for debugging
        logger.info("CORS Filter - Processing request: " + requestContext.getMethod() + " " + requestContext.getUriInfo().getRequestUri());
        
        // Get the origin from the request
        String origin = requestContext.getHeaderString("Origin");
        
        // Allow specific origins (more secure than *)
        String allowedOrigin = "*"; // You can be more specific: "http://localhost:5174"
        if (origin != null && (origin.startsWith("http://localhost:") || origin.startsWith("https://localhost:"))) {
            allowedOrigin = origin;
        }
        
        // Set CORS headers
        responseContext.getHeaders().add("Access-Control-Allow-Origin", allowedOrigin);
        responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
        responseContext.getHeaders().add("Access-Control-Allow-Headers", 
            "origin, content-type, accept, authorization, x-requested-with, x-custom-header");
        responseContext.getHeaders().add("Access-Control-Allow-Methods", 
            "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH");
        responseContext.getHeaders().add("Access-Control-Max-Age", "86400"); // 24 hours
        
        // Handle preflight requests
        if ("OPTIONS".equals(requestContext.getMethod())) {
            logger.info("CORS Filter - Handling OPTIONS preflight request");
            responseContext.setStatus(200);
            responseContext.setEntity(""); // Empty response body for OPTIONS
        }
        
        logger.info("CORS Filter - Added CORS headers for origin: " + allowedOrigin);
    }
}