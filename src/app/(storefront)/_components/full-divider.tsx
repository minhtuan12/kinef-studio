import { Divider } from "@mui/material";

export default function FullWidthDivider() {
	return <Divider
		sx={{
			borderColor: "#6E6E6E",
			width: "100vw",
			ml: "calc(50% - 50vw)",
			"@supports (width: 100dvw)": {
				width: "100dvw",
				ml: "calc(50% - 51dvw)",
			},
		}}
	/>
};
