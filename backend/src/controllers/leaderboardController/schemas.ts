import { Schema } from 'express-validator'

export const LeaderboardPaginationSchema: Schema = {
  limit: {
    in: 'query',
    isInt: {
      options: {
        max: 50,
        min: 0
      }
    },
    optional: true
  },
  page: {
    in: 'query',
    isInt: {
      options: {
        min: 1
      }
    },
    optional: true
  },
  sortOrder: {
    in: 'query',
    isIn: {
      options: [["ascend", "descend"]],
      errorMessage: "Invalid sort order"
    }
  },
  sortColumn: {
    in: 'query',
    isString: {},
    optional: true
  },
  startDate: {
    in: 'query',
    isISO8601: true,
    optional: true
  },
  endDate: {
    in: 'query',
    isISO8601: true,
    optional: true
  }
}
