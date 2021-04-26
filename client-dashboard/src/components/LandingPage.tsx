import React from 'react'
import landingPageTemplate from '../templates/landingPageTemplate'

const LandingPage: React.FC = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: landingPageTemplate }} />
  )
}

export default LandingPage
