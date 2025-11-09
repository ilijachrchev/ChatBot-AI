import React from 'react'

type Props = {
    params: {
        domainid: string;
        customerid: string;
    }
}

const CustomerSignUpForm = async ({ params }: Props) => {

    const question = await onDomainCustomerResponses(params.customerid);
  return (
    <div>CustomerSignUpForm</div>
  )
}

export default CustomerSignUpForm