import React from 'react'
import { UseFormRegister } from "react-hook-form";
import { ConversationSearchForm } from "@/schemas/conversation.schema";
import { string } from 'zod'

type Props = {
  register: UseFormRegister<ConversationSearchForm>;
  domains?: { 
        name: string;
        id: string;
        icon: string 
    }[] 
    | undefined;
};


const ConversationSearch = ({ register, domains }: Props) => {
  return (
    <div className='flex flex-col py-3'>
        <div className='flex flex-col py-3'>
            <select
                {...register("domain")}
                className='px-3 py-4 text-sm border-[1px] rounded-lg mr-5'>
                    <option disabled value="selected">
                        Domain Name
                    </option>
                    {domains?.map((domain) => (
                        <option value={domain.id} key={domain.id}>
                            {domain.name}
                        </option>
                    ))}
                </select>
        </div>
    </div>
  )
}

export default ConversationSearch