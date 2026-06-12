const commonStacks = {
	cegid: ['React.js', 'TypeScript', 'Webpack', 'RxJS', 'Material UI', 'Storybook', 'GraphQL', '.NET', 'Scrum'],
	covea: ['React.js', 'TypeScript', 'MongoDB', 'Docker', 'GraphQL', 'Jest'],
	freelance: ['React.js', 'Node.js', 'TypeScript', 'MySQL'],
	gtsi: ['TypeScript', 'Node.js', 'Angular', 'RxJS', 'Cypress'],
	piy: ['Oracle Database', 'TypeScript', 'React.js', 'Node.js', 'Knex.js', 'Jest'],
	tutor: {
		en: ['Mentoring', 'Communication', 'Feedback', 'Teaching', 'Empathy'],
		es: ['Mentoría', 'Comunicación', 'Feedback', 'Pedagogía', 'Empatía'],
		fr: ['Tutorat', 'Communication', 'Feedback', 'Pédagogie', 'Empathie'],
	},
	winstate: ['React.js', 'Node.js', 'MySQL', 'Jest'],
};

export const experiencesByLanguage = {
	en: [
		{
			company: 'Sogeti',
			role: 'Full Stack Developer / Apprentice Mentor',
			period: 'Oct. 2021 - Present',
			missions: [
				{
					title: 'Apprentice Mentor',
					period: 'Mar. 2025 - Present',
					context: 'Technical mentoring and day-to-day support for work-study students within the team.',
					highlights: [
						'Onboarding apprentices into team tools, processes, and delivery methods.',
						'Daily technical mentoring, problem-solving support, and autonomy tracking.',
						'Coordination with training centers and constructive feedback on progression.',
					],
					stack: commonStacks.tutor.en,
				},
				{
					title: 'CEGID · MFE point-of-sale application',
					period: 'Jun. 2024 - Present',
					context: 'Modernization of multi-device point-of-sale interfaces based on micro frontends.',
					highlights: [
						'Integrated and prototyped new interfaces with the UX/UI team.',
						'Evolved Storybook coverage for multiple applications and shared components.',
						'Built new pages while keeping legacy and new versions running together.',
						'Progressively increased unit test coverage.',
					],
					stack: commonStacks.cegid,
				},
				{
					title: 'COVEA · Sales assistance tool',
					period: 'Oct. 2023 - Jun. 2024',
					context: 'Web application for prospecting, selling, and invoicing mutual insurance products.',
					highlights: [
						'Developed frontend and backend modules following quality-focused practices.',
						'Built secure integrations with internal mutual insurance systems and business processes.',
						'Worked with QA, provided advanced technical support, and documented internal workflows.',
					],
					stack: commonStacks.covea,
				},
				{
					title: 'GTSI · Airbus ground tests',
					period: 'Jun. 2023 - Oct. 2023',
					context: 'Application for creating, updating, and executing ground tests on Airbus FAL lines.',
					highlights: [
						'Designed features for critical environments linked to aircraft assembly.',
						'Developed interfaces and integrations to support test execution.',
						'Handled testing, preventive maintenance, and support for complex incidents.',
					],
					stack: commonStacks.gtsi,
				},
				{
					title: 'PIY · Airbus aircraft configuration and sales',
					period: 'Oct. 2021 - Jun. 2023',
					context: 'Web application for aircraft configuration, invoicing, and change management in a sales process.',
					highlights: [
						'Built configuration, invoicing, and impact analysis features.',
						'Collaborated with functional teams to align design, sales, and configuration constraints.',
						'Delivered evolutive maintenance, technical documentation, and sensitive data protection.',
					],
					stack: commonStacks.piy,
				},
			],
		},
		{
			company: 'Freelance',
			role: 'Full Stack Developer',
			period: 'Jan. 2020 - Oct. 2021',
			location: 'Toulouse, France · Remote',
			summary: 'Designed, developed, and maintained web applications for different clients, covering analysis, frontend, backend, testing, deployment, and support.',
			highlights: [
				'Built custom web solutions with React.js, Node.js, TypeScript, and MySQL.',
				'Contributed across the full delivery cycle, from requirements gathering to maintenance.',
			],
			stack: commonStacks.freelance,
		},
		{
			company: 'WINSTATE',
			role: 'Web Application Developer',
			period: 'Apr. 2019 - Jul. 2019',
			location: 'Toulouse, France',
			summary: 'Delivered a complete web application from functional analysis to deployment and user documentation.',
			highlights: [
				'Defined scope, designed the application, and created the database.',
				'Developed frontend/backend features, ran pre-deployment tests, and wrote user guidance.',
			],
			stack: commonStacks.winstate,
		},
	],
	es: [
		{
			company: 'Sogeti',
			role: 'Desarrollador Full Stack / Tutor de alternantes',
			period: 'Oct. 2021 - Actualidad',
			missions: [
				{
					title: 'Tutor de alternantes',
					period: 'Mar. 2025 - Actualidad',
					context: 'Acompañamiento técnico y seguimiento diario de estudiantes en alternancia dentro del equipo.',
					highlights: [
						'Integración de nuevos alternantes en herramientas, procesos y metodologías del equipo.',
						'Mentoría técnica diaria, apoyo en resolución de problemas y seguimiento de autonomía.',
						'Coordinación con centros de formación y feedback constructivo sobre la progresión.',
					],
					stack: commonStacks.tutor.es,
				},
				{
					title: 'CEGID · Aplicación de punto de venta MFE',
					period: 'Jun. 2024 - Actualidad',
					context: 'Modernización de interfaces de una aplicación de punto de venta multi-dispositivo basada en micro frontends.',
					highlights: [
						'Integración y prototipado de nuevas interfaces junto al equipo UX/UI.',
						'Evolución de Storybook para diferentes aplicaciones y componentes compartidos.',
						'Desarrollo de nuevas páginas manteniendo la convivencia entre versión antigua y nueva.',
						'Incremento progresivo de la cobertura de tests unitarios.',
					],
					stack: commonStacks.cegid,
				},
				{
					title: 'COVEA · Herramienta de ayuda a la venta',
					period: 'Oct. 2023 - Jun. 2024',
					context: 'Aplicación web para prospección, venta y facturación de productos mutualistas.',
					highlights: [
						'Desarrollo de módulos frontend y backend siguiendo buenas prácticas de calidad.',
						'Integración segura con sistemas internos de mutuas y adaptación a procesos métier.',
						'Colaboración con QA, soporte técnico avanzado y documentación para equipos internos.',
					],
					stack: commonStacks.covea,
				},
				{
					title: 'GTSI · Tests de suelo Airbus',
					period: 'Jun. 2023 - Oct. 2023',
					context: 'Aplicación para creación, modificación y ejecución de tests de suelo en líneas FAL Airbus.',
					highlights: [
						'Diseño de funcionalidades para entornos críticos vinculados al ensamblaje aeronáutico.',
						'Desarrollo de interfaces e integraciones para facilitar la ejecución de pruebas.',
						'Testing, mantenimiento preventivo y soporte técnico sobre incidencias complejas.',
					],
					stack: commonStacks.gtsi,
				},
				{
					title: 'PIY · Configuración y venta de aviones Airbus',
					period: 'Oct. 2021 - Jun. 2023',
					context: 'Aplicación web para configuración, facturación y modificación de aviones dentro de un proceso de venta.',
					highlights: [
						'Desarrollo de funcionalidades de configuración, facturación y análisis de impactos.',
						'Colaboración con equipos funcionales para asegurar coherencia entre diseño, venta y configuración.',
						'Mantenimiento evolutivo, documentación técnica y protección de datos sensibles.',
					],
					stack: commonStacks.piy,
				},
			],
		},
		{
			company: 'Freelance',
			role: 'Desarrollador Full Stack',
			period: 'Ene. 2020 - Oct. 2021',
			location: 'Toulouse, Francia · Remoto',
			summary: 'Diseño, desarrollo y mantenimiento de aplicaciones web para distintos clientes, cubriendo análisis, frontend, backend, pruebas, despliegue y soporte.',
			highlights: [
				'Construcción de soluciones web a medida con React.js, Node.js, TypeScript y MySQL.',
				'Participación en el ciclo completo de entrega, desde la toma de necesidades hasta el mantenimiento.',
			],
			stack: commonStacks.freelance,
		},
		{
			company: 'WINSTATE',
			role: 'Desarrollador de aplicaciones web',
			period: 'Abr. 2019 - Jul. 2019',
			location: 'Toulouse, Francia',
			summary: 'Desarrollo completo de una aplicación web, desde el análisis funcional hasta el despliegue y la documentación de usuario.',
			highlights: [
				'Definición del alcance, diseño de la aplicación y creación de la base de datos.',
				'Desarrollo frontend/backend, pruebas previas al despliegue y elaboración de guía de uso.',
			],
			stack: commonStacks.winstate,
		},
	],
	fr: [
		{
			company: 'Sogeti',
			role: 'Développeur Full Stack / Tuteur d’alternants',
			period: 'Oct. 2021 - Aujourd’hui',
			missions: [
				{
					title: 'Tuteur d’alternants',
					period: 'Mars 2025 - Aujourd’hui',
					context: 'Accompagnement technique et suivi quotidien des étudiants en alternance au sein de l’équipe.',
					highlights: [
						'Intégration des alternants aux outils, processus et méthodologies de l’équipe.',
						'Tutorat technique quotidien, aide à la résolution de problèmes et suivi de l’autonomie.',
						'Coordination avec les centres de formation et feedback constructif sur la progression.',
					],
					stack: commonStacks.tutor.fr,
				},
				{
					title: 'CEGID · Application point de vente MFE',
					period: 'Juin 2024 - Aujourd’hui',
					context: 'Modernisation des interfaces d’une application point de vente multi-device basée sur des micro frontends.',
					highlights: [
						'Intégration et prototypage de nouvelles interfaces avec l’équipe UX/UI.',
						'Évolution des Storybooks pour différentes applications et composants partagés.',
						'Développement de nouvelles pages tout en faisant cohabiter ancienne et nouvelle version.',
						'Augmentation progressive de la couverture de tests unitaires.',
					],
					stack: commonStacks.cegid,
				},
				{
					title: 'COVEA · Outil d’aide à la vente',
					period: 'Oct. 2023 - Juin 2024',
					context: 'Application web destinée à la prospection, la vente et la facturation de produits mutualistes.',
					highlights: [
						'Développement de modules frontend et backend selon des pratiques orientées qualité.',
						'Intégration sécurisée avec les systèmes internes des mutuelles et adaptation aux processus métier.',
						'Collaboration avec la QA, support technique avancé et documentation pour les équipes internes.',
					],
					stack: commonStacks.covea,
				},
				{
					title: 'GTSI · Tests au sol Airbus',
					period: 'Juin 2023 - Oct. 2023',
					context: 'Application de création, modification et exécution de tests au sol sur les lignes FAL Airbus.',
					highlights: [
						'Conception de fonctionnalités pour des environnements critiques liés à l’assemblage aéronautique.',
						'Développement d’interfaces et d’intégrations pour faciliter l’exécution des tests.',
						'Tests, maintenance préventive et support technique sur des incidents complexes.',
					],
					stack: commonStacks.gtsi,
				},
				{
					title: 'PIY · Configuration et vente d’avions Airbus',
					period: 'Oct. 2021 - Juin 2023',
					context: 'Application web de configuration, facturation et modification d’avions dans un processus de vente.',
					highlights: [
						'Développement de fonctionnalités de configuration, facturation et analyse d’impacts.',
						'Collaboration avec les équipes fonctionnelles pour aligner design, vente et configuration.',
						'Maintenance évolutive, documentation technique et protection des données sensibles.',
					],
					stack: commonStacks.piy,
				},
			],
		},
		{
			company: 'Freelance',
			role: 'Développeur Full Stack',
			period: 'Janv. 2020 - Oct. 2021',
			location: 'Toulouse, France · Remote',
			summary: 'Conception, développement et maintenance d’applications web pour différents clients, couvrant analyse, frontend, backend, tests, déploiement et support.',
			highlights: [
				'Construction de solutions web sur mesure avec React.js, Node.js, TypeScript et MySQL.',
				'Participation au cycle complet de livraison, de la prise de besoin à la maintenance.',
			],
			stack: commonStacks.freelance,
		},
		{
			company: 'WINSTATE',
			role: 'Développeur d’applications web',
			period: 'Avr. 2019 - Juil. 2019',
			location: 'Toulouse, France',
			summary: 'Développement complet d’une application web, de l’analyse fonctionnelle au déploiement et à la documentation utilisateur.',
			highlights: [
				'Définition du périmètre, conception de l’application et création de la base de données.',
				'Développement frontend/backend, tests avant déploiement et rédaction d’un guide utilisateur.',
			],
			stack: commonStacks.winstate,
		},
	],
};
