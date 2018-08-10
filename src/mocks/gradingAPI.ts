import { Grading, GradingOverview } from '../components/academy/grading/gradingShape'
import { mock2DRuneLibrary as mockLibrary } from './assessmentAPI'
import { mockFetchRole, Role, Roles } from './userAPI'

export const mockGradingOverviews: GradingOverview[] = [
  {
    adjustments: 0,
    assessmentCategory: 'Mission',
    assessmentId: 0,
    assessmentName: 'Mission 0 ',
    currentGrade: 69,
    initialGrade: 69,
    maximumGrade: 100,
    studentId: 0,
    studentName: 'Al Gorithm',
    submissionId: 0
  },
  {
    adjustments: -2,
    assessmentCategory: 'Mission',
    assessmentId: 1,
    assessmentName: 'Mission 1',
    currentGrade: -2,
    initialGrade: 0,
    maximumGrade: 400,
    studentId: 0,
    studentName: 'Dee Sign',
    submissionId: 1
  },
  {
    adjustments: 4,
    assessmentCategory: 'Mission',
    assessmentId: 0,
    assessmentName: 'Mission 0',
    currentGrade: 1000,
    initialGrade: 996,
    maximumGrade: 1000,
    studentId: 1,
    studentName: 'May Trix',
    submissionId: 2
  }
]

/**
 * Mock for fetching a trainer/admin's student grading information.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchGradingOverview = (accessToken: string): GradingOverview[] | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Roles.admin, Roles.trainer]
  const role: Role | null = mockFetchRole(accessToken)
  if (role === null || !permittedRoles.includes(role)) {
    return null
  } else {
    return mockGradingOverviews
  }
}

const mockGrading: Grading = [
  {
    question: {
      answer: "This student's answer to the 0th question......",
      content: `
Hello and welcome to this assessment! This is the *0th question*.

\`\`\`
>>> import this
\`\`\`
`,
      comment: null,
      id: 0,
      library: mockLibrary,
      solutionTemplate: '0th question mock solution template',
      type: 'programming'
    },
    maximumGrade: 1000,
    grade: {
      adjustment: 0,
      grade: 0,
      comment: ''
    }
  },
  {
    question: {
      answer: "This student's answer to the 1st question",
      comment: null,
      content: 'Hello and welcome to this assessment! This is the 1st question.',
      id: 1,
      library: mockLibrary,
      solutionTemplate: '1st question mock solution template',
      type: 'programming'
    },
    maximumGrade: 200,
    grade: {
      adjustment: 0,
      grade: 100,
      comment: 'Good job!!'
    }
  },
  {
    question: {
      // C is the answer
      answer: 3,
      comment: null,
      solution: 2,
      content:
        'Hello and welcome to this assessment! This is the 2nd question. Oddly enough, it is an MCQ question!',
      choices: [
        {
          content: 'A',
          hint: 'hint A'
        },
        {
          content: 'B',
          hint: 'hint B'
        },
        {
          content: 'C',
          hint: 'hint C'
        },
        {
          content: 'D',
          hint: 'hint D'
        }
      ],
      id: 2,
      library: mockLibrary,
      type: 'mcq'
    },
    maximumGrade: 100,
    grade: {
      adjustment: 0,
      grade: 50,
      comment:
        'A Very long string. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a leo et lectus gravida sagittis a non neque. Phasellus consectetur arcu vitae metus vulputate commodo. Phasellus varius sollicitudin quam a porta. Pellentesque mollis molestie felis vitae imperdiet. Nam porta purus ac tellus luctus ultrices. Integer pellentesque nisl vel nunc ullamcorper, in vehicula est dapibus. Nunc dapibus neque dolor, ut mattis massa mattis in. Fusce nec risus nec ex pharetra lacinia. Mauris sit amet ullamcorper sapien. Suspendisse scelerisque neque sed nunc tincidunt, ac semper enim efficitur. Ut sit amet eleifend arcu. Donec viverra at justo vitae eleifend. Morbi ut erat ultricies, hendrerit mi ut, ornare mauris.'
    }
  }
]

/**
 * Mock for fetching a trainer/admin's student grading information.
 * A null value is returned for invalid token or role.
 *
 * @param accessToken a valid access token for the cadet backend.
 */
export const mockFetchGrading = (accessToken: string, submissionId: number): Grading | null => {
  // mocks backend role fetching
  const permittedRoles: Role[] = [Roles.admin, Roles.trainer]
  const role: Role | null = mockFetchRole(accessToken)
  if (role === null || !permittedRoles.includes(role)) {
    return null
  } else {
    return mockGrading
  }
}
