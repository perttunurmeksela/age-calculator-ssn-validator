// Array of characters used for checkMark calculation
const checkMarkTable = '0123456789ABCDEFHJKLMNPRSTUVWXY'.split('');

// Regex pattern for validating Finnish social security numbers (SSN)
const regex = /^(0[1-9]|[12]\d|3[01])(0[1-9]|1[0-2])([5-9]\d\+|\d\d[-|U-Y]|[012]\d[A-F])\d{3}[\dA-Z]$/;

// Constants for February, days in months, and century mappings
const february = '02';
const monthDaysMap = new Map([
  ['01', 31],
  ['02', 28],
  ['03', 31],
  ['04', 30],
  ['05', 31],
  ['06', 30],
  ['07', 31],
  ['08', 31],
  ['09', 30],
  ['10', 31],
  ['11', 30],
  ['12', 31],
]);

const centuryMap = new Map([
  ['F', 2000],
  ['E', 2000],
  ['D', 2000],
  ['C', 2000],
  ['B', 2000],
  ['A', 2000],
  ['U', 1900],
  ['V', 1900],
  ['W', 1900],
  ['X', 1900],
  ['Y', 1900],
  ['-', 1900],
  ['+', 1800],
]);

/* 
 JQuery function to execute when document is ready
 Event listener for input changes in the SSN field
 Validate SSN and add appropriate CSS classes
*/
$(document).ready(function () {
  $('#ssn').on('input', function () {
    const ssn = $(this).val();

    if (isValidSSN(ssn)) {
      $('#ssn').removeClass('is-invalid').addClass('is-valid');
    } else {
      $('#ssn').removeClass('is-valid').addClass('is-invalid');
    }
  });
});

// Function to check if a year is a leap year
function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// Function to get the number of days in a given month of a given year
function daysInGivenMonth(year, month) {
  const daysInMonth = monthDaysMap.get(month);

  if (month === february && isLeapYear(year)) {
    return daysInMonth + 1;
  }

  return daysInMonth;
}

// Function to calculate age based on the provided SSN
function calculateAge() {
  const ssn = $('#ssn').val();

  if (!isValidSSN(ssn)) {
    $('#ageOutput').html('<div class="alert alert-danger" role="alert">Virheellinen henkilötunnus! Tarkista syöte.</div>');
    return;
  }

  // Convert SSN to a valid date format
  const birthDate = new Date(
    parseInt(ssn.substring(4, 6), 10) + centuryMap.get(ssn.charAt(6)),
    parseInt(ssn.substring(2, 4), 10) - 1,
    parseInt(ssn.substring(0, 2), 10)
  );
  const today = new Date();

  // Calculate age
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  /* 
    Check if today's month is earlier than the birth month, or if it's the same month
    but today's date is earlier than the birth date, AND if the current year is exactly
    one year after the birth year
  */
  if (
    (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) &&
    today.getFullYear() === birthDate.getFullYear() + 1
  ) {
    years--;
  }

  /* 
    Adjust age if month or day difference is negative
    Also checks leap year
  */
  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;

    if (isLeapYear(today.getFullYear() - 1) && months >= 0 && days >= 0) {
      const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth() - 1, 0).getDate();
      days += prevMonthLastDay;
    }
  }

  /* 
    Checks if the date (days) is negative, which means that the birthdate is greater than today's date.
    If the date is negative, the code calculates the last day of the previous month (prevMonthLastDay)
    using the new Date() constructor, and ultimately adds this day to the previous month (months)
    and subtracts one from the value of months.
  */
  if (days < 0) {
    const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += prevMonthLastDay;
    months--;
  }

  // Display age
  $('#ageOutput').html(`<div class="alert alert-success" role="alert">Ikä: ${years} vuotta, ${months} kuukautta, ${days} päivää</div>`);
}

// Function to validate SSN based on the regex and checkMark calculation
function isValidSSN(personalSSN) {
  if (!regex.test(personalSSN)) {
    return false;
  }

  const dayOfMonth = parseInt(personalSSN.substring(0, 2), 10);
  const month = personalSSN.substring(2, 4);
  const centuryId = personalSSN.charAt(6);
  const year = parseInt(personalSSN.substring(4, 6), 10) + centuryMap.get(centuryId);
  const rollingId = personalSSN.substring(7, 10);
  const checkMark = personalSSN.substring(10, 11);
  const daysInMonth = daysInGivenMonth(year, month);

  // Check if month and day are valid
  if (!monthDaysMap.get(month) || dayOfMonth > daysInMonth) {
    return false;
  }

  // Calculate checkMark and compare with the last character of SSN
  const checkMarkBase = parseInt(personalSSN.substring(0, 6) + rollingId, 10);

  return checkMark === checkMarkTable[checkMarkBase % 31];
}
