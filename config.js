module.exports = {
  // The page of your published Vionode app that users should land on.
  APP_URL: 'https://vionode.com',

  // Exact sites that may open INSIDE the app window (sign-in and payment).
  // Only these addresses match, not their subdomains: a wildcard like "lovable.app"
  // would let anyone's Lovable site open in the window, which has no address bar.
  // Every other link opens in the user's normal browser.
  ALLOWED_HOSTS: [
    'xbszisymadgmfpueamsh.supabase.co',
    'oauth.lovable.app',
    'accounts.google.com',
    'checkout.stripe.com',
    'billing.stripe.com',
  ],

  // How often the app checks whether you published a new version in Lovable.
  CHECK_EVERY_MINUTES: 10,
};
