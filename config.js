module.exports = {
  // The page of your published Vionode app that users should land on.
  APP_URL: 'https://vionode.com',

  // Sites that may open INSIDE the app window (sign-in and payment).
  // Every other link opens in the user's normal browser.
  ALLOWED_HOSTS: [
    'supabase.co',
    'lovable.app',
    'accounts.google.com',
    'login.microsoftonline.com',
    'checkout.stripe.com',
    'billing.stripe.com',
  ],

  // How often the app checks whether you published a new version in Lovable.
  CHECK_EVERY_MINUTES: 10,
};
