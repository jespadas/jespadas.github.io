import profilePicture from '../me.jpg';

export function ProfileHeader({ intro }) {
  return (
    <>
      <h1 className="intro">{intro}</h1>
      <img
        className="profile-picture"
        src={profilePicture}
        alt="Julio Espadas"
      />
    </>
  );
}
