export function createInquiry(values) {
  const name = values.name.trim();
  const email = values.email.trim();
  const organization = values.organization.trim();
  const service = values.service;
  const message = values.message.trim();
  const subject = `Shermanator inquiry: ${service}`;
  const body = [
    'Hello Mary,',
    '',
    message,
    '',
    `Interested in: ${service}`,
    ...(organization ? [`Organization: ${organization}`] : []),
    '',
    name,
    email,
  ].join('\n');

  return { subject, body };
}

export function createMailto(contactEmail, inquiry) {
  return `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(inquiry.subject)}&body=${encodeURIComponent(inquiry.body)}`;
}