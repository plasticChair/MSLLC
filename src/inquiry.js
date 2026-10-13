export function createInquiry(values, copy) {
  const name = values.name.trim();
  const email = values.email.trim();
  const organization = values.organization.trim();
  const service = values.service;
  const message = values.message.trim();
  const subject = `${copy.subject_prefix}: ${service}`;
  const body = [
    copy.greeting,
    '',
    message,
    '',
    `${copy.interest_label}: ${service}`,
    ...(organization ? [`${copy.organization_label}: ${organization}`] : []),
    '',
    name,
    email,
  ].join('\n');

  return { subject, body };
}

export function createMailto(contactEmail, inquiry) {
  return `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(inquiry.subject)}&body=${encodeURIComponent(inquiry.body)}`;
}