import { useAnswers } from '@/hooks/email-marketing/use-marketing'
import React from 'react'
import { Loader } from '../loader'
import { MessageSquare } from 'lucide-react'

type Props = {
  id?: string
}

const Answers = ({ id }: Props) => {
  const { answers, loading } = useAnswers(id!)

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Loader loading={loading}>
        {answers.length > 0 ? (
          answers.map((answer, answerIndex) =>
            answer.customer.map((customer, customerIndex) =>
              customer.questions.length > 0 ? (
                customer.questions.map((question, questionIndex) => (
                  <div
                    key={`${answerIndex}-${customerIndex}-${questionIndex}`}
                    className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-950 dark:text-white mb-1">
                          {question.question}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {question.answered || 'No answer provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  key={`${answerIndex}-${customerIndex}-no-questions`}
                  className="text-center py-8 text-slate-600 dark:text-slate-400"
                >
                  No questions answered yet
                </div>
              )
            )
          )
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No answers available
            </p>
          </div>
        )}
      </Loader>
    </div>
  )
}

export default Answers
