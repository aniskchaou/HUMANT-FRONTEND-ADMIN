package com.dev.delta.controllers;

import com.dev.delta.services.StripeService;
import com.dev.delta.services.TenantService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stripe")
@CrossOrigin
@Tag(name = "Stripe", description = "Stripe payment and plan APIs")
public class StripeController {

    private final StripeService stripeService;
    private final TenantService tenantService;

    public StripeController(StripeService stripeService, TenantService tenantService) {
        this.stripeService = stripeService;
        this.tenantService = tenantService;
    }

    /**
     * Return available subscription plans from Stripe.
     * GET /api/stripe/plans
     */
    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getPlans() {
        try {
            return ResponseEntity.ok(stripeService.getAvailablePlans());
        } catch (Exception e) {
            // Return static fallback plans if Stripe is not yet configured
            return ResponseEntity.ok(getStaticFallbackPlans());
        }
    }

    /**
     * Stripe webhook receiver.
     * POST /api/stripe/webhook
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
                                                 @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, stripeService.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Webhook error");
        }

        switch (event.getType()) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                Subscription sub = (Subscription) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (sub != null) {
                    LocalDateTime endsAt = sub.getCurrentPeriodEnd() != null
                            ? LocalDateTime.ofInstant(Instant.ofEpochSecond(sub.getCurrentPeriodEnd()), ZoneId.systemDefault())
                            : null;
                    String priceId = sub.getItems() != null && sub.getItems().getData() != null
                            && !sub.getItems().getData().isEmpty()
                            ? sub.getItems().getData().get(0).getPrice().getId()
                            : null;
                    tenantService.activateSubscription(sub.getCustomer(), sub.getId(), priceId, endsAt);
                }
                break;
            }
            case "customer.subscription.deleted": {
                Subscription sub = (Subscription) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (sub != null) {
                    tenantService.cancelSubscription(sub.getCustomer());
                }
                break;
            }
            case "invoice.payment_failed": {
                Invoice invoice = (Invoice) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (invoice != null) {
                    tenantService.cancelSubscription(invoice.getCustomer());
                }
                break;
            }
            default:
                break;
        }

        return ResponseEntity.ok("OK");
    }

    private List<Map<String, Object>> getStaticFallbackPlans() {
        return List.of(
                Map.of("priceId", "starter_monthly", "nickname", "Starter", "amount", 2900L,
                        "currency", "usd", "interval", "month",
                        "features", List.of("Up to 10 users", "Core HR modules", "Email support")),
                Map.of("priceId", "professional_monthly", "nickname", "Professional", "amount", 7900L,
                        "currency", "usd", "interval", "month",
                        "features", List.of("Up to 50 users", "All modules", "Payroll & Recruitment", "Priority support")),
                Map.of("priceId", "enterprise_monthly", "nickname", "Enterprise", "amount", 19900L,
                        "currency", "usd", "interval", "month",
                        "features", List.of("Unlimited users", "All modules", "Custom integrations", "Dedicated support"))
        );
    }
}
