import React, { useEffect } from "react";
import { Helmet } from "react-helmet";

const AdComponent = () => {
  useEffect(() => {
    // Re-run the AdSense script to make sure it loads
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div>
      <Helmet>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          data-ad-client="ca-pub-8739143670476648"
          crossOrigin="anonymous"
        />
      </Helmet>

      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8739143670476648"
        data-ad-slot="YOUR_AD_SLOT_ID"
        data-ad-format="auto"
      />
    </div>
  );
};

export default AdComponent;
