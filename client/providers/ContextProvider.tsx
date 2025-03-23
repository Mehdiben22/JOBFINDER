//The "use client" directive tells Next.js that this is a Client Component
"use client"
//context functions only work on client side
import React from 'react'
import {GlobalContextProvider} from "@/context/globalContext.js"
import {JobsContextProvider} from "@/context/jobContext.js"

interface Props {
    children : React.ReactNode;
}

function ContextProvider( {children}: Props) {
    return <GlobalContextProvider>
        <JobsContextProvider>
        {children}
        </JobsContextProvider>
    </GlobalContextProvider>
}

export default ContextProvider