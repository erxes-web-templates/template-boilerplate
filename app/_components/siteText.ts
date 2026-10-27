import { createSiteText, type SiteTextEntry } from "@site-core/lib/siteText";

/**
 * Interface text in this template that the site's owner can change, with the
 * template's English defaults. Read with useSiteText() from this module;
 * edited in the builder's Site text panel, saved to the site config's `texts`.
 *
 * Keys are `<area>.<thing>` and must never be renamed once shipped — a saved
 * replacement is stored under the key. Group by where the text appears.
 *
 * What does NOT belong here: copy a section's editor already sets (title,
 * eyebrow, description, primaryCta…), which stays in that section's config,
 * and hints shown only in the builder ("Select a form…"), which stay in
 * English behind isBuildMode().
 */
export const siteText = {
  "header.openMenu": { group: "Header", label: "Open menu (screen readers)", default: "Open menu" },
  "header.account": { group: "Header", label: "Account button (screen readers)", default: "Account" },

  "search.label": { group: "Search", label: "Search box (screen readers)", default: "Search products" },
  "search.searching": { group: "Search", label: "While searching", default: "Searching…" },
  "search.viewAll": { group: "Search", label: "See all results link", default: "View all results →" },
  "search.noResults": { group: "Search", label: "Nothing found", default: "No results found." },
  "search.tooShort": { group: "Search", label: "Search term too short", default: "Type at least 2 characters to search." },

  "cart.title": { group: "Cart", label: "Cart title and cart button", default: "Cart" },
  "cart.empty": { group: "Cart", label: "Empty cart message", default: "Your cart is empty." },
  "cart.emptyHint": { group: "Cart", label: "Empty cart hint", default: "Add products to get started." },
  "cart.total": { group: "Cart", label: "Total label", default: "Total" },
  "cart.checkout": { group: "Cart", label: "Checkout button", default: "Checkout" },
  "cart.clear": { group: "Cart", label: "Empty the cart button", default: "Clear" },
  "cart.decrease": { group: "Cart", label: "One fewer (screen readers)", default: "Decrease quantity" },
  "cart.increase": { group: "Cart", label: "One more (screen readers)", default: "Increase quantity" },
  "cart.remove": { group: "Cart", label: "Remove item (screen readers)", default: "Remove item" },

  "footer.linksHeading": { group: "Footer", label: "Links heading", default: "Quick Links" },
  "footer.contactHeading": { group: "Footer", label: "Contact heading", default: "Contact Us" },
  "footer.rights": { group: "Footer", label: "Copyright ending (after your name)", default: "All rights reserved." },
  "footer.privacy": { group: "Footer", label: "Privacy link", default: "Privacy Policy" },
  "footer.terms": { group: "Footer", label: "Terms link", default: "Terms of Service" },
  "footer.nameFallback": { group: "Footer", label: "Business name (when the site has none)", default: "Company" },
  "footer.linkHome": { group: "Footer", label: "Default link: home (when no footer menu is set)", default: "Home" },
  "footer.linkTours": { group: "Footer", label: "Default link: tours", default: "Tours" },
  "footer.linkAbout": { group: "Footer", label: "Default link: about", default: "About Us" },
  "footer.linkContact": { group: "Footer", label: "Default link: contact", default: "Contact" },
  "footer.linkInquiry": { group: "Footer", label: "Default link: inquiry", default: "Inquiry" },

  "booking.cardTitle": { group: "Booking form", label: "Form card title", default: "Availability check" },
  "booking.arrive": { group: "Booking form", label: "Arrival date label", default: "Check-in" },
  "booking.leave": { group: "Booking form", label: "Departure date label", default: "Check-out" },
  "booking.selectDate": { group: "Booking form", label: "Date placeholder", default: "Pick a date" },
  "booking.adults": { group: "Booking form", label: "Adults label", default: "Adults" },
  "booking.children": { group: "Booking form", label: "Children label", default: "Children" },
  "booking.rooms": { group: "Booking form", label: "Rooms label", default: "Rooms" },
  "booking.submit": { group: "Booking form", label: "Search button", default: "Check rooms" },

  "carousel.learnMore": { group: "Carousel", label: "Slide button", default: "Learn more" },
  "carousel.previous": { group: "Carousel", label: "Previous slide (screen readers)", default: "Previous slide" },
  "carousel.next": { group: "Carousel", label: "Next slide (screen readers)", default: "Next slide" },

  "contact.where": { group: "Contact section", label: "Address label", default: "Our Location" },
  "contact.call": { group: "Contact section", label: "Phone label", default: "Phone Number" },
  "contact.write": { group: "Contact section", label: "Email label", default: "Email Address" },
  "contact.follow": { group: "Contact section", label: "Social links label", default: "Follow Us on" },
  "contact.sentTitle": { group: "Contact section", label: "Sent message title", default: "Message Sent!" },

  "gallery.photo": { group: "Gallery", label: "Photo name (screen readers, before the number)", default: "Image" },

  "posts.readMore": { group: "Blog posts", label: "Post button", default: "Read more" },
  "posts.viewAll": { group: "Blog posts", label: "See all posts link", default: "View all" },

  "products.view": { group: "Products", label: "Product button", default: "View product" },
  "products.untitled": { group: "Products", label: "Product without a name", default: "Untitled product" },
  "products.uncategorized": { group: "Products", label: "Product without a category", default: "Uncategorized" },
  "products.noImage": { group: "Products", label: "Product without a photo", default: "No image available" },
  "products.loadError": { group: "Products", label: "Products failed to load", default: "Unable to load products. Please try again later." },
  "categories.view": { group: "Products", label: "Category button", default: "View products" },
  "categories.loadError": { group: "Products", label: "Categories failed to load", default: "Unable to load categories right now. Please try again later." },

  "recent.emptyTitle": { group: "Recently viewed", label: "Nothing viewed yet (signed in): title", default: "No viewed products yet" },
  "recent.emptyBody": { group: "Recently viewed", label: "Nothing viewed yet (signed in): message", default: "Start browsing products to see them appear here." },
  "recent.guestEmptyTitle": { group: "Recently viewed", label: "Nothing viewed yet (guest): title", default: "No locally viewed products yet" },
  "recent.guestEmptyBody": { group: "Recently viewed", label: "Nothing viewed yet (guest): message", default: "Open a product page and it will appear here on this browser." },
  "recent.unknownTime": { group: "Recently viewed", label: "When viewed is not known", default: "Unknown" },
  "recent.loadError": { group: "Recently viewed", label: "Failed to load", default: "Unable to load recently viewed products right now. Please try again later." },

  "rooms.view": { group: "Rooms", label: "Room details button", default: "View" },
  "rooms.book": { group: "Rooms", label: "Book button", default: "Book now" },
  "rooms.untitled": { group: "Rooms", label: "Room without a name", default: "Untitled room" },
  "rooms.loadError": { group: "Rooms", label: "Rooms failed to load", default: "Unable to load rooms. Please try again later." },

  "requestForm.routeQuestion": { group: "Request form", label: "Request type question", default: "What kind of request is this?" },
  "requestForm.summary": { group: "Request form", label: "Summary label", default: "Summary" },
  "requestForm.details": { group: "Request form", label: "Details label", default: "What happened" },
  "requestForm.category": { group: "Request form", label: "Category label", default: "Category" },
  "requestForm.categoryUnsure": { group: "Request form", label: "No category chosen", default: "Not sure" },
  "requestForm.location": { group: "Request form", label: "Location label", default: "Location (optional)" },
  "requestForm.name": { group: "Request form", label: "Name label", default: "Your name" },
  "requestForm.email": { group: "Request form", label: "Email label", default: "Email" },
  "requestForm.phone": { group: "Request form", label: "Phone label", default: "Phone (optional)" },
  "requestForm.send": { group: "Request form", label: "Send button", default: "Send request" },
  "requestForm.sending": { group: "Request form", label: "Send button while sending", default: "Sending…" },
  "requestForm.summaryRequired": { group: "Request form", label: "Error: summary missing", default: "Enter a short summary of your request." },
  "requestForm.detailsTooShort": { group: "Request form", label: "Error: details too short", default: "Describe what happened in at least a sentence or two, so we can act on it." },
  "requestForm.emailRequired": { group: "Request form", label: "Error: email missing", default: "Enter an email address so we can reply to you." },
  "requestForm.emailInvalid": { group: "Request form", label: "Error: email not valid", default: "Enter an email address in the format name@example.com." },
  "requestForm.routeRequired": { group: "Request form", label: "Error: request type not chosen", default: "Choose what kind of request this is." },
  "requestForm.sendError": { group: "Request form", label: "Error: could not send", default: "Your request could not be sent." },
  "requestForm.sentEyebrow": { group: "Request form", label: "Sent: small label", default: "Request sent" },
  "requestForm.sentTitle": { group: "Request form", label: "Sent: heading", default: "We have your request" },
  "requestForm.referenceLabel": { group: "Request form", label: "Sent: reference label", default: "Your reference" },
  "requestForm.savedTitle": { group: "Request form", label: "Sent (signed in): note title", default: "This request is saved to your account." },
  "requestForm.savedBody": { group: "Request form", label: "Sent (signed in): note", default: "You can follow its progress at any time under your requests." },
  "requestForm.keepReferenceTitle": { group: "Request form", label: "Sent (guest): note title", default: "Save this reference now." },
  "requestForm.keepReferenceBody": { group: "Request form", label: "Sent (guest): note", default: "You submitted without signing in, so this reference is the only way back to this request. We cannot look it up for you by name." },
  "requestForm.another": { group: "Request form", label: "Submit another button", default: "Submit another" },

  "trackRequest.referenceLabel": { group: "Track a request", label: "Reference label", default: "Reference" },
  "trackRequest.placeholder": { group: "Track a request", label: "Reference example", default: "REQ-2026-0417" },
  "trackRequest.find": { group: "Track a request", label: "Find button", default: "Find it" },
  "trackRequest.finding": { group: "Track a request", label: "Find button while looking", default: "Looking…" },
  "trackRequest.referenceRequired": { group: "Track a request", label: "Error: reference missing", default: "Enter the reference from your confirmation." },
  "trackRequest.notFound": { group: "Track a request", label: "Nothing matches", default: "No request matches that reference. Check it against your confirmation — it has to match exactly." },
} as const satisfies Record<string, SiteTextEntry>;

/** The shared core's site text, bound to this template's catalog. */
export const { SiteTextProvider, useSiteText } = createSiteText(siteText);

export type SiteTextKey = keyof typeof siteText;
