package com.dev.delta.services;

import com.dev.delta.entities.Tenant;
import com.dev.delta.repositories.TenantRepository;
import com.stripe.Stripe;
import com.stripe.model.Customer;
import com.stripe.model.Price;
import com.stripe.model.PriceCollection;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PriceListParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StripeService {

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.base-url:http://localhost:4201}")
    private String baseUrl;

    private void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    /**
     * Create a Stripe Customer for a new tenant.
     */
    public String createCustomer(String email, String companyName) throws Exception {
        init();
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(email)
                .setName(companyName)
                .build();
        Customer customer = Customer.create(params);
        return customer.getId();
    }

    /**
     * Create a Stripe Checkout Session for a subscription plan.
     */
    public String createCheckoutSession(String stripeCustomerId, String priceId, String tenantCode) throws Exception {
        init();
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(stripeCustomerId)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(priceId)
                                .setQuantity(1L)
                                .build()
                )
                .setSuccessUrl(baseUrl + "/subscription/success?tenant=" + tenantCode + "&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(baseUrl + "/subscription/cancel?tenant=" + tenantCode)
                .putMetadata("tenantCode", tenantCode)
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }

    /**
     * Cancel a Stripe subscription.
     */
    public void cancelSubscription(String subscriptionId) throws Exception {
        init();
        Subscription subscription = Subscription.retrieve(subscriptionId);
        subscription.cancel();
    }

    /**
     * Fetch available subscription plans (prices) from Stripe filtered by product metadata.
     */
    public List<Map<String, Object>> getAvailablePlans() throws Exception {
        init();
        PriceListParams params = PriceListParams.builder()
                .setActive(true)
                .setType(PriceListParams.Type.RECURRING)
                .setLimit(10L)
                .build();

        PriceCollection prices = Price.list(params);
        List<Map<String, Object>> plans = new ArrayList<>();

        for (Price price : prices.getData()) {
            Map<String, Object> plan = new HashMap<>();
            plan.put("priceId", price.getId());
            plan.put("currency", price.getCurrency());
            plan.put("amount", price.getUnitAmount());
            plan.put("interval", price.getRecurring() != null ? price.getRecurring().getInterval() : "month");
            plan.put("nickname", price.getNickname() != null ? price.getNickname() : price.getId());
            plans.add(plan);
        }

        return plans;
    }

    /**
     * Map a Stripe price ID to a Tenant.Plan enum.
     */
    public Tenant.Plan resolvePlanFromPriceId(String priceId) {
        if (priceId == null) return Tenant.Plan.FREE;
        String lower = priceId.toLowerCase();
        if (lower.contains("enterprise")) return Tenant.Plan.ENTERPRISE;
        if (lower.contains("professional") || lower.contains("pro")) return Tenant.Plan.PROFESSIONAL;
        if (lower.contains("starter")) return Tenant.Plan.STARTER;
        return Tenant.Plan.STARTER;
    }
}
