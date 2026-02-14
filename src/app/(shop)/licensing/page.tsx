export const metadata = {
  title: 'Copyright & Licensing - Banwell Designs',
  description: 'Information on the cost and terms of licensing Banwell Designs photographs for use in your projects.',
};

export default function LicensingPage() {
  return (
    <div className="bg-black">
      {/* Section 1: Heading */}
      <section className="max-w-[1140px] mx-auto px-[8%] pt-12 pb-4 text-center">
        <h1 className="text-[36px] md:text-[65px] font-semibold text-white mb-4">
          Copyright &amp; Licensing
        </h1>
      </section>

      {/* Section 2: Content */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
            Welcome to Banwell Designs&rsquo; and Tom Banwell Designs&rsquo; photo licensing page! Here, you
            will find information on the cost and terms of licensing our photographs for use in your projects.
          </p>
          <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
            We pride ourselves on creating unique and original designs that are protected by copyright law.
            This means that any use of our photographs without our permission is considered copyright
            infringement, and we take this matter very seriously. However, we understand that there may be
            situations where you would like to use our photographs for commercial or personal use, and we
            are happy to discuss licensing options with you.
          </p>
          <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
            Our licensing fees vary depending on the intended use of the photograph. We offer a range of
            licensing options, including one-time use, limited use, and unlimited use. Our fees are based
            on the scope of use, the duration of use, the size of the image, and other factors. To receive
            a quote for licensing one of our photographs, please contact us directly and provide us with
            the details of your project.
          </p>
          <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
            By licensing one of our photographs, you agree to the terms of the license agreement, which
            includes restrictions on the use of the image, the duration of use, and the attribution
            requirements. Failure to comply with these terms may result in legal action, including but not
            limited to, a lawsuit for copyright infringement.
          </p>
          <p className="text-[14px] md:text-[16px] font-light text-white leading-relaxed">
            If you have any questions or would like to license one of our photographs, please do not
            hesitate to contact us. We are happy to work with you to find the best licensing option for
            your needs.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-[1140px] mx-auto px-[8%] py-4">
        <hr className="border-t-[3.7px] border-white w-[82%] mx-auto" />
      </div>

      {/* Section 3: Contact CTA */}
      <section className="max-w-[1140px] mx-auto px-[8%] py-16 text-center">
        <h2 className="text-[25px] md:text-[36px] font-semibold text-white capitalize mb-4">
          Licensing Inquiries
        </h2>
        <p className="text-[14px] md:text-[22px] font-light text-white max-w-3xl mx-auto mb-8 leading-relaxed">
          To request a licensing quote, contact us through our Etsy shop or social media with details
          about your project, including intended use, duration, and scope.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href="https://www.etsy.com/shop/BanwellDesigns"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-[#A22020] border border-white rounded-full hover:text-[#F74646] hover:bg-transparent transition-colors"
          >
            Contact via Etsy
          </a>
          <a
            href="https://www.instagram.com/banwell.designs/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-[35px] py-[16px] text-[16px] font-normal capitalize text-white bg-transparent border border-white rounded-full hover:text-[#F74646] transition-colors"
          >
            Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
