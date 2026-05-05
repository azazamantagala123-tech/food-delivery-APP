FOOD DELIVERY API
AUTH APIs (24)
USER AUTH
POST /auth/user/register
POST /auth/user/login
DELIVERY AUTH
POST /auth/delivery/login
POST /auth/delivery/register → Delivery signup
ADMIN AUTH
POST /auth/admin/login
POST /auth/verify-otp → Verify OTP 
POST /auth/resend-otp → Resend OTP 
POST /auth/logout → Logout user 
POST /auth/refresh-token → Refresh JWT 
POST /auth/social-login → Google login 
POST /auth/biometric → Face/Fingerprint login 
POST /auth/forgot-password → Forgot password 
POST /auth/reset-password → Reset password 
POST /auth/2fa-enable → Enable 2FA 
POST /auth/2fa-verify → Verify 2FA 
POST /auth/device-register → Register device 
POST /auth/device-remove → Remove device 
POST /auth/sessions → Get sessions 
POST /auth/sessions-delete → Delete session 
POST /auth/block → Block suspicious login 
POST /auth/unblock → Unblock user 
POST /auth/email-verify → Verify email 
POST /auth/email-resend → Resend email verify
POST /auth/guest-login → Quick checkout without full registration
USER APIs (36)
GET /user/profile → Get profile 
PUT /user/profile → Update profile 
POST /user/avatar → Upload avatar 
GET /user/address → Get addresses 
POST /user/address → Add address 
PUT /user/address/:id → Update address 
DELETE /user/address/:id → Delete address 
GET /user/wallet → Get wallet 
POST /user/wallet/add → Add money 
GET /user/wallet/history → Wallet history 
GET /user/notifications → Get notifications 
POST /user/notifications/read → Mark read 
GET /user/preferences → Get preferences 
PUT /user/preferences → Update preferences 
GET /user/orders → User orders 
GET /user/rewards → Reward points 
POST /user/referral → Apply referral 
GET /user/subscription → Get subscription 
POST /user/subscription/upgrade → Upgrade plan 
DELETE /user/account → Delete account 
GET /user/activity → User activity 
POST /user/feedback → Submit feedback 
GET /user/favorites → Favorite foods 
POST /user/favorites/add → Add favorite 
DELETE /user/favorites/remove → Remove favorite
GET /user/membership → Gold/VIP benefits
POST /user/login-history → Login activity
GET /user/security-settings → Security settings
POST /user/change-password → Change password
POST /user/support → Create support ticket
GET /user/support/:id → Track support
POST /user/report-issue → Report issue
GET /user/payment-methods → Saved cards/UPI
POST /user/add-payment-method → Add payment method
DELETE /user/remove-payment-method → Remove payment
GET /user/loyalty-tier → Gold/Silver level
POST /user/notification-settings → Manage notifications
ADMIN APIs (36) 
POST /admin/food → Add food 
PUT /admin/food/:id → Update food 
DELETE /admin/food/:id → Delete food 
GET /admin/foods → All foods 
GET /admin/orders → All orders 
PUT /admin/order-status → Update order 
GET /admin/users → All users 
DELETE /admin/user/:id → Block user 
GET /admin/analytics → Analytics 
GET /admin/revenue → Revenue 
GET /admin/reports → Reports 
POST /admin/offer → Create offer 
DELETE /admin/offer/:id → Delete offer 
GET /admin/offers → All offers 
POST /admin/category → Add category 
PUT /admin/category/:id → Update category 
DELETE /admin/category/:id → Delete category 
GET /admin/dashboard → Dashboard data 
GET /admin/logs → System logs 
POST /admin/notification → Send notification 
GET /admin/reviews → All reviews 
DELETE /admin/review/:id → Delete review 
GET /admin/fraud → Fraud logs 
POST /admin/settings → Update settings 
GET /admin/settings → Get setting
GET /admin/user/:id → User detail
GET /admin/delivery/:id → Delivery detail
POST /admin/delivery/approve → Approve delivery
POST /admin/delivery/reject → Reject delivery
GET /admin/live-orders → Live tracking
GET /admin/system-health → Server health
POST /admin/push-notification → Send push notification
GET /admin/complaints → All complaints
POST /admin/refund-approve → Approve refund
POST /admin/refund-reject → Reject refund
GET /admin/ai-insights → AI analytics
POST /admin/feature-toggle → Enable/disable feature
GET /admin/audit-logs → Activity logs
FOOD APIs (30) 
GET /food/ → All foods 
GET /food/:id → Food details 
GET /food/category/:id → By category 
POST /food/search → Search food 
GET /food/popular → Popular food 
GET /food/recommended → AI recommended 
GET /food/trending → Trending items 
GET /food/offers → Discount items 
GET /food/combo → Combo meals 
POST /food/review → Add review 
GET /food/review/:id → Get reviews 
GET /food/rating/:id → Get rating 
POST /food/customize → Customize item 
GET /food/nutrition/:id → Nutrition info 
GET /food/availability/:id → Check availability 
GET /food/related/:id → Related food 
GET /food/tags → Food tags 
GET /food/new → New arrivals 
GET /food/top-rated → Top rated 
GET /food/veg → Veg items 
GET /food/non-veg → Non veg items 
GET /food/quick → Quick delivery 
GET /food/premium → Premium foods 
GET /food/chef-special → Chef specials 
GET /food/seasonal → Seasonal items 
POST /food/bulk → Bulk order menu 
GET /food/diet → Diet foods 
GET /food/keto → Keto foods 
GET /food/protein → Protein foods 
GET /food/kids → Kids menu
CART APIs (15)
GET /cart/ → Get cart 
POST /cart/add → Add item 
PUT /cart/update → Update qty 
DELETE /cart/remove/:id → Remove item 
DELETE /cart/clear → Clear cart 
POST /cart/apply-coupon → Apply coupon 
DELETE /cart/remove-coupon → Remove coupon 
GET /cart/summary → Cart summary 
POST /cart/save → Save cart 
GET /cart/restore → Restore cart 
POST /cart/gift → Gift cart 
GET /cart/tax → Tax calculation 
GET /cart/delivery-fee → Delivery fee 
POST /cart/tip → Add tip 
GET /cart/estimate-time → Estimate time
ORDER APIs (25) 
POST /order/create → Create order 
GET /order/:id → Order details 
GET /order/user → User orders 
POST /order/cancel → Cancel order 
POST /order/reorder → Reorder 
POST /order/rate → Rate order 
GET /order/status/:id → Order status 
POST /order/schedule → Schedule order 
GET /order/history → Order history 
POST /order/split → Split order 
POST /order/merge → Merge order 
POST /order/invoice → Generate invoice 
GET /order/invoice/:id → Get invoice 
POST /order/support → Support request 
GET /order/support/:id → Support status 
POST /order/issue → Report issue 
POST /order/refund → Request refund 
GET /order/refund/:id → Refund status 
POST /order/priority → Priority order 
GET /order/eta/:id → Estimated time 
POST /order/instructions → Add instructions 
GET /order/timeline/:id → Order timeline 
POST /order/reschedule → Reschedule order 
GET /order/live-status → Live status 
POST /order/confirm → Confirm delivery 
PAYMENT APIs (15) 
POST /payment/initiate → Start payment 
POST /payment/verify → Verify payment 
GET /payment/history → Payment history 
POST /payment/refund → Refund 
GET /payment/methods → Payment methods 
POST /payment/add-method → Add payment method 
DELETE /payment/remove-method → Remove method 
POST /payment/default-method → Set default 
GET /payment/invoice → Invoices 
GET /payment/tax → Tax details 
POST /payment/wallet → Wallet payment 
POST /payment/cod → Cash on delivery 
POST /payment/split → Split payment 
GET /payment/status/:id → Payment status 
POST /payment/retry → Retry payment 
AI APIs (15) 
GET /ai/recommend → Recommendations 
POST /ai/chat → Chatbot 
POST /ai/voice → Voice order 
GET /ai/prediction → Next order prediction 
POST /ai/diet → Diet plan 
GET /ai/calories → Calorie calculation 
POST /ai/image-detect → Food from image 
GET /ai/preferences → AI preferences 
POST /ai/optimize-cart → Optimize cart 
GET /ai/best-time → Best order time 
POST /ai/dynamic-price → Dynamic pricing 
GET /ai/fraud-detect → Fraud detection 
POST /ai/feedback → AI feedback 
GET /ai/taste-profile → Taste profile 
POST /ai/combo-builder → Smart combo 
DELIVERY APIs (29) 
POST /delivery/upload-docs → Upload KYC
GET /delivery/status → Approval status
GET /delivery/orders → Assigned orders list
GET /delivery/order/:id → Order detail
POST /delivery/navigation → Start navigation (map)
POST /delivery/cash-collect → Cash collect update
GET /delivery/wallet → Wallet balance
POST /delivery/withdraw → Withdraw earnings
GET /delivery/ratings → Ratings & reviews
POST /delivery/support → Raise issue
GET /delivery/shift → Shift timing
POST /delivery/break → Break mode
GET /delivery/track/:id → Track order 
POST /delivery/location → Update location 
GET /delivery/agent/:id → Agent details 
POST /delivery/assign → Assign delivery 
POST /delivery/accept → Accept delivery 
POST /delivery/reject → Reject delivery 
GET /delivery/history → Delivery history 
GET /delivery/earnings → Agent earnings 
POST /delivery/status → Update status 
GET /delivery/route → Optimized route 
POST /delivery/pickup → Pickup confirm 
POST /delivery/drop → Drop confirm 
GET /delivery/availability → Agent availability 
POST /delivery/online → Go online 
POST /delivery/offline → Go offline
 
 