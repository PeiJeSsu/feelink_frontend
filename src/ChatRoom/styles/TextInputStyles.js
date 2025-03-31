export const containerStyle = {
	position: "relative",
	width: "100%",
	border: '1px solid rgba(107, 114, 128, 0.1)',
	borderRadius: '12px',
	padding: '12px',
	display: 'flex',
	flexDirection: 'column-reverse',
	gap: '12px',
	backgroundColor: '#FFFFFF',
};

export const buttonContainerStyle = {
	display: 'flex',
	justifyContent: 'space-between',
	gap: '8px',
};

export const textFieldStyle = {
	width: '100%',
	'& .MuiInput-root': {
		fontSize: '14px',
		color: '#1F2937',
		'&:before': {
			borderBottom: '1px solid rgba(107, 114, 128, 0.1)',
		},
		'&:hover:not(.Mui-disabled):before': {
			borderBottom: '1px solid rgba(124, 58, 237, 0.5)',
		},
		'&.Mui-focused:after': {
			borderBottom: '2px solid #7C3AED',
		},
	},
	'& .MuiInput-input::placeholder': {
		color: '#9CA3AF',
	},
};
