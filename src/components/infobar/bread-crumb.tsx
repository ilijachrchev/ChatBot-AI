"use client"
import React from 'react'

type Props = {}

const BreadCrumb = (props: Props) => {
    //WIP ::: SET UP use side bar hook for reakl time chat and chat bot stuff
  return (
    <div className='flex flex-col'>
        <div className='flex gap-5 items-center'>
            <h2 className='text-3xl font-bold capitalize'>Title</h2>
        </div>
        <p className='text-gray-500 text-sm'>
            {/* {page == 'settings' 
            ? 'Manage your account settings, preferences and integrations' 
            : page == 'dashboard'
            ? 'A detailed overview of your metrics, usage, customers and more'
            : page == 'appointment'
            ? 'View and edit all your appointments'
            : page == 'email-marketing'
            ? 'Send bulk emails to your customers'
            : page == 'integrations'
            ? 'Connect third-party applications into SendWise-AI' */}
             Modify domain settings, change chatbot options, enter sales questions and train your bot to do waht you want it to!
            {/* } */}
        </p>
    </div>
  )
}

export default BreadCrumb