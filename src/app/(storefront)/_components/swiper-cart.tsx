'use client'

import { Global } from '@emotion/react';
import { styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { useStorefront } from '../_context/storefront-context';
import { CartContent } from '../cart/page';

const drawerBleeding = 56;

interface Props {
	/**
	 * Injected by the documentation to work in an iframe.
	 * You won't need it on your project.
	 */
	window?: () => Window;
}

const Root = styled('div')(({ theme }) => ({
	height: '100%',
	backgroundColor: grey[100],
	...theme.applyStyles('dark', {
		backgroundColor: (theme.vars || theme).palette.background.default,
	}),
}));

const StyledBox = styled('div')(({ theme }) => ({
	backgroundColor: '#fff',
	...theme.applyStyles('dark', {
		backgroundColor: grey[800],
	}),
}));

const Puller = styled('div')(({ theme }) => ({
	width: 30,
	height: 6,
	backgroundColor: grey[300],
	borderRadius: 3,
	position: 'absolute',
	top: 8,
	left: 'calc(50% - 15px)',
	...theme.applyStyles('dark', {
		backgroundColor: grey[900],
	}),
}));

export default function SwipeableEdgeDrawer(props: Props) {
	const { window } = props;
	const { cartCount, openSwiperCart, setOpenSwiperCart } = useStorefront();

	const toggleDrawer = (newOpen: boolean) => () => {
		setOpenSwiperCart(newOpen);
	};

	// This is used only for the example
	const container = window !== undefined ? () => window().document.body : undefined;

	return <Root>
		<CssBaseline />
		<Global
			styles={{
				'.MuiDrawer-root > .MuiPaper-root': {
					height: `calc(80% - ${drawerBleeding}px)`,
					overflow: 'visible',
				},
			}}
		/>
		<SwipeableDrawer
			container={container}
			anchor="bottom"
			open={openSwiperCart}
			onClose={toggleDrawer(false)}
			onOpen={toggleDrawer(true)}
			swipeAreaWidth={drawerBleeding}
			disableSwipeToOpen={false}
			keepMounted
		>
			{openSwiperCart && <StyledBox
				sx={{
					background: 'black',
					position: 'absolute',
					top: -drawerBleeding,
					borderTopLeftRadius: 8,
					borderTopRightRadius: 8,
					visibility: 'visible',
					right: 0,
					left: 0,
				}}
			>
				<Puller />
				<Typography sx={{ px: 2, py: '10px', color: 'white', fontFamily: 'var(--font-serif)', fontSize: 24 }}>{cartCount} items</Typography>
			</StyledBox>
			}
			<StyledBox sx={{ px: 2, pt: 1, pb: 4, height: '100%', overflow: 'auto' }}>
				<CartContent />
			</StyledBox>
		</SwipeableDrawer>
	</Root>
}
