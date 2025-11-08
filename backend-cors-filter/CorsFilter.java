package com.furniturestore.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * CORS Filter for Furniture Store API
 * This filter adds the necessary CORS headers to allow frontend access
 */
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Get the origin from the request
        String origin = httpRequest.getHeader("Origin");
        
        // Allow specific origins (add your production domain here)
        if (origin != null && (
            origin.equals("http://localhost:5173") ||     // Vite default port
            origin.equals("http://localhost:5174") ||     // Your current port
            origin.equals("http://localhost:3000") ||     // Common React port
            origin.equals("https://your-production-domain.com") // Replace with your domain
        )) {
            httpResponse.setHeader("Access-Control-Allow-Origin", origin);
        }
        
        // Set CORS headers
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", 
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control");
        httpResponse.setHeader("Access-Control-Allow-Credentials", "true");
        httpResponse.setHeader("Access-Control-Max-Age", "3600");
        
        // Handle preflight OPTIONS request
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        // Continue with the request
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization code if needed
    }

    @Override
    public void destroy() {
        // Cleanup code if needed
    }
}