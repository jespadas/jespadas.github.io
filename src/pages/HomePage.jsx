import { ProfileHeader } from '../components/ProfileHeader';
import { SiteFooter } from '../components/SiteFooter';
import { SocialLinks } from '../components/SocialLinks';
import { TypedTagline } from '../components/TypedTagline';
import { profileConfig } from '../config/profile';

export function HomePage() {
  return (
    <main className="App-main">
      <ProfileHeader intro={profileConfig.intro} />
      <TypedTagline descriptions={profileConfig.descriptions} />
      <SocialLinks links={profileConfig.socialLinks} />
      <SiteFooter />
    </main>
  );
}
