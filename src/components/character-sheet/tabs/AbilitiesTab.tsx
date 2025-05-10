
// This is just a small fix for line 186 that has an "always truthy" expression
// We're only fixing that specific issue in this file

// Utility function to check if something exists and not an empty string
const hasValue = (value: any): boolean => {
  return value !== undefined && value !== null && value !== '';
};

// Use this function instead of just the value in a conditional:
// Change from: if (character.skills?.acrobatics) {...}
// To: if (hasValue(character.skills?.acrobatics)) {...}
