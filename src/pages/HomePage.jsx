import { ProfileHeader } from '../components/ProfileHeader';
import { SiteFooter } from '../components/SiteFooter';
import { SocialLinks } from '../components/SocialLinks';
import { TypedTagline } from '../components/TypedTagline';
import { profileConfig } from '../config/profile';

export function HomePage({ t }) {
  return (
    <main className="App-main">
      <ProfileHeader intro={t.intro} />
      <TypedTagline descriptions={t.descriptions || profileConfig.descriptions} />
      <SocialLinks links={profileConfig.socialLinks} />
      <SiteFooter t={t} />
    </main>
  );
}
