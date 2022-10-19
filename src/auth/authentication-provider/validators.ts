export function validateEmail(value: string) {
  const re = /\S+@\S+\.\S+/;
  if (!re.test(value)) {
    return "Enter a valid email address";
  }
}

export function validateOTP(value: string) {
  const re = /\b\d{6}\b/;
  if (!re.test(value)) {
    return "Confirmation code should be 6 digits";
  }
}
