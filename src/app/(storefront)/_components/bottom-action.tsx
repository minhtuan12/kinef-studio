'use client'

import { Button, Typography } from "@mui/material"
import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useStorefront } from "../_context/storefront-context"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

export function BottomAction() {
	const { selectedCase } = useStorefront();
	const router = useRouter();
	const pathname = usePathname();
	const isSecondStep = pathname.includes('charms');
	const isLastStep = pathname.includes('order');
	const currentStep = isSecondStep ? 2 : (isLastStep ? 3 : 1);

	const backText = (isLastStep || isSecondStep) ? 'Back' : 'Back to home';
	const backHref = isLastStep ? '/custom-case/charms' : (isSecondStep ? '/custom-case' : '/');
	const nextHref = isSecondStep ? '/custom-case/order' : '/custom-case/charms';

	return !isLastStep ? <div className="relative py-28 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
		<Link href={backHref} className="flex items-center gap-1 text-[15px] ">
			<ArrowLeft size={13} />{backText}
		</Link>
		<Typography
			sx={{
				color: "#838383",
				fontFamily: "var(--font-serif)",
				fontStyle: "italic",
				fontSize: 24,
				textAlign: "center",
				alignSelf: "center",
				position: { md: "absolute" },
				left: { md: "50%" },
				transform: { md: "translateX(-50%)" },
			}}
		>
			step {currentStep} of 3
		</Typography>
		{!isLastStep ? <Button
			variant="outlined"
			disabled={!selectedCase}
			sx={{
				borderColor: "#1a1816",
				color: "#1a1816",
				borderRadius: 0,
				px: 5,
				textTransform: 'none',
				height: 40,
			}}
			onClick={() => router.push(nextHref)}
			className="flex items-center justify-center gap-2 hover:!bg-black hover:!text-white"
		>
			Continue <ArrowRight size={13} className="-mt-0.5" />
		</Button> : <Button
			variant="outlined"
			sx={{
				color: "#ffffff",
				borderColor: "#000000",
				borderRadius: 0,
				px: 5,
				textTransform: 'none',
				height: 40,
			}}
			onClick={() => router.push(nextHref)}
			className="flex items-center justify-center gap-2 !bg-black hover:!bg-white hover:!text-black"
		>
			Place order <ArrowRight size={13} className="-mt-0.5" />
		</Button>
		}
	</div> : null;
}
