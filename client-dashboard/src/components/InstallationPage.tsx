import React, { useState, useEffect } from 'react'
import installationPageTemplate from '../templates/installationPageTemplate'
import axios from 'axios'

const InstallationPage: React.FC = () => {
  const [link, setLink] = useState(String.empty)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { slackInstalHref } } = await axios.get('api/settings');
      setLink(slackInstalHref);
    };

    fetchData();
  }, []);

  return (
    <div dangerouslySetInnerHTML={{ __html: installationPageTemplate.format(link) }} />
  )
}

export default InstallationPage
