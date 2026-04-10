import { Divider } from "@mui/material";

export default function FullWidthDivider() {
	return <Divider
		sx={{
			borderColor: "#6E6E6E",
			width: "100vw",
			ml: "calc(50% - 50vw - 10px)",
		}}
	/>
};
