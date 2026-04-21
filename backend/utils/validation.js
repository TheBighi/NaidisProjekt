const ISO_8601_WITH_TZ_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

const hasTimezoneInfo = (value) => ISO_8601_WITH_TZ_REGEX.test(value);

const isValidIsoTimestamp = (value) => {
  if (typeof value !== "string" || !hasTimezoneInfo(value)) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
};

const parseRange = (start, end) => {
  if (!isValidIsoTimestamp(start) || !isValidIsoTimestamp(end)) {
    return null;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (endDate <= startDate) {
    return null;
  }

  return { startDate, endDate };
};

module.exports = {
  isValidIsoTimestamp,
  parseRange
};
