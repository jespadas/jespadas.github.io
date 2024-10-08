import React, { Component } from 'react';
import { ReactTyped } from 'react-typed';
import './App.css';
import Configs from './configurations.json';
import { FaHeart, FaBeer } from 'react-icons/fa';
import Me from './me.jpg';
class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			darkBackgroundModes: ['day'],
			lightBackgroundModes: ['night'],
			backgroundType: Configs.backgroundType || 'plain',
			appClass: Configs.plainBackgroundMode || 'daylight',
			devIntro: Configs.devIntro,
			devDesc: Configs.devDesc,
			devDesc2: Configs.devDesc2,
			devDesc3: Configs.devDesc3,
			devDesc4: Configs.devDesc4,
			devDesc5: Configs.devDesc5,
			backgroundMode: 'default',
			backgroundIndex: 0,
			bgStyle: {},
			icons: Configs.icons || [],
		};
	}

	componentWillMount = () => {
		if (this.checkIfPlainTypeEnabled()) {
			return true;
		} else if (this.checkIfGradientTypeEnabled()) {
			this.setState({
				appClass: 'gradient',
				bgStyle: this.prepareGradientStyleSheets(),
			});
		} else if (this.checkIfImageTypeEnabled()) {
			this.setState({
				appClass: 'full-bg-image',
				bgStyle: this.prepareBackgroundImageStyle(),
			});
		}
	};

	checkIfNightModeEnabled = () => {
		return (
			this.state.backgroundType === 'plain' &&
			this.state.appClass === 'nightlight'
		);
	};

	checkIfDayModeEnabled = () => {
		return (
			this.state.backgroundType === 'plain' &&
			this.state.appClass === 'daylight'
		);
	};

	checkIfGradientTypeEnabled = () => {
		return this.state.backgroundType === 'gradient';
	};

	checkIfPlainTypeEnabled = () => {
		return this.state.backgroundType === 'plain';
	};

	checkIfImageTypeEnabled = () => {
		return this.state.backgroundType === 'image';
	};

	prepareGradientStyleSheets = () => {
		if (Configs.gradientColors) {
			return {
				background: 'linear-gradient(-45deg, ' + Configs.gradientColors + ')',
				backgroundSize: '400% 400%',
			};
		} else {
			return {
				background:
					'linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB)',
				backgroundSize: '400% 400%',
			};
		}
	};

	changeThemeMode = (e) => {
		if (this.checkIfNightModeEnabled()) {
			this.setState({
				appClass: 'daylight',
				backgroundIndex: 0,
				backgroundMode: this.state.darkBackgroundModes[0],
			});
		} else if (this.checkIfDayModeEnabled()) {
			this.setState({
				appClass: 'nightlight',
				backgroundIndex: 0,
				backgroundMode: this.state.lightBackgroundModes[0],
			});
		}
	};

	render() {
		const {
			appClass,
			bgStyle,
			backgroundMode,
			devIntro,
			devDesc,
			devDesc2,
			devDesc3,
			devDesc4,
			devDesc5,
			icons,
		} = this.state;

		return (
			<div className={appClass} style={bgStyle}>
				<div className='change-mode' onClick={this.changeThemeMode} />
				<div className={backgroundMode}>
					<main className='App-main'>
						<h1 className='intro'>{devIntro}</h1>
						<img
							src={Me}
							alt='profile'
							style={{ width: '8rem', borderRadius: '50%' }}
						/>
						<div className='tagline'>
							<ReactTyped
								strings={[devDesc, devDesc2, devDesc3, devDesc4, devDesc5]}
								typeSpeed={40}
								backSpeed={40}
								loop
								smartBackspace
							></ReactTyped>
						</div>
						<div className='icons-social'>
							{icons.map((icon) => (
								<a
									target='_blank'
									rel='noopener noreferrer'
									href={`${icon.url}`}
								>
									<i className={`fab ${icon.image}`} />
								</a>
							))}
						</div>
						<br />
						<div className='footer'>
							<br />
							<span>
								Made with <FaHeart /> and <FaBeer />{' '}
							</span>
						</div>
					</main>
				</div>
			</div>
		);
	}
}

export default App;
