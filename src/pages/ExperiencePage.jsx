import { experiencesByLanguage } from '../data/experiencesByLanguage';

const SKILL_TONES = {
	angular: 'angular',
	communication: 'soft',
	comunicacion: 'soft',
	cypress: 'testing',
	docker: 'infra',
	empathie: 'soft',
	empathy: 'soft',
	empatia: 'soft',
	empatía: 'soft',
	feedback: 'soft',
	graphql: 'api',
	jest: 'testing',
	knexjs: 'backend',
	materialui: 'ui',
	mentoria: 'soft',
	mentoring: 'soft',
	mentoría: 'soft',
	mongodb: 'database',
	mysql: 'database',
	net: 'backend',
	nodejs: 'backend',
	oracledatabase: 'database',
	pedagogia: 'soft',
	pedagogía: 'soft',
	reactjs: 'react',
	rxjs: 'reactive',
	scrum: 'process',
	storybook: 'ui',
	typescript: 'typescript',
	webpack: 'infra',
};

function normalizeSkill(skill) {
	return skill
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]/gi, '')
		.toLowerCase();
}

function getSkillTone(skill) {
	return SKILL_TONES[normalizeSkill(skill)] || 'default';
}

function SkillChips({ skills, label }) {
	if (!skills || skills.length === 0) {
		return null;
	}

	return (
		<div className='skill-chips' aria-label={label}>
			{skills.map((skill) => (
				<span
					className={`skill-chip skill-chip--${getSkillTone(skill)}`}
					key={skill}
				>
					{skill}
				</span>
			))}
		</div>
	);
}

export function ExperiencePage({ language, t }) {
	const professionalExperiences = experiencesByLanguage[language] || experiencesByLanguage.es;

	return (
		<main className='experience-page'>
			<section className='experience-hero' aria-labelledby='experience-title'>
				<p className='experience-kicker'>{t.kicker}</p>
				<h1 id='experience-title'>{t.title}</h1>
				<p>{t.heroDescription}</p>
			</section>

			<section className='experience-list' aria-label={t.listLabel}>
				{professionalExperiences.map((experience) => (
					<article
						className='experience-card'
						key={`${experience.company}-${experience.period}`}
					>
						<div className='experience-card__header'>
							<div>
								<p className='experience-card__company'>{experience.company}</p>
								<h2>{experience.role}</h2>
							</div>
							<p className='experience-card__period'>{experience.period}</p>
						</div>

						{experience.summary ? (
							<p className='experience-card__summary'>{experience.summary}</p>
						) : null}

						{experience.highlights ? (
							<ul className='experience-card__highlights'>
								{experience.highlights.map((highlight) => (
									<li key={highlight}>{highlight}</li>
								))}
							</ul>
						) : null}

						<SkillChips label={t.skillsLabel} skills={experience.stack} />

						{experience.missions ? (
							<div className='experience-missions'>
								{experience.missions.map((mission) => (
									<section className='experience-mission' key={mission.title}>
										<div className='experience-mission__header'>
											<h3>{mission.title}</h3>
											<p>{mission.period}</p>
										</div>

										<p className='experience-mission__context'>
											{mission.context}
										</p>

										<ul className='experience-card__highlights'>
											{mission.highlights.map((highlight) => (
												<li key={highlight}>{highlight}</li>
											))}
										</ul>

										<SkillChips
											label={`${t.skillsLabel} ${mission.title}`}
											skills={mission.stack}
										/>
									</section>
								))}
							</div>
						) : null}
					</article>
				))}
			</section>
		</main>
	);
}
