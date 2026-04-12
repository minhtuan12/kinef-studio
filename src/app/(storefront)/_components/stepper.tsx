"use client";

import { Box, Step, Stepper, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from '@mui/styles';
import { usePathname } from "next/navigation";

type StepItem = {
  href: string;
  label: string;
};

const steps: StepItem[] = [
  { href: "/custom-case", label: "base colour" },
  { href: "/custom-case/charms", label: "charms" },
  { href: "/custom-case/order", label: "order" },
];

const useStyles: any = makeStyles((theme: Theme) => ({
  customStepper: {
    gap: 20,

    '& .MuiStep-root': {
      padding: 0,
    },
    '& .MuiButtonBase-root': {
      padding: 16,
    },
    '& .MuiSvgIcon-root': {
      width: '44px',
      height: '44px',
      border: '1px solid #000000',
      borderRadius: '50%',
      fill: '#ffffff',
      color: '#000000 !important',
    },
    '& .Mui-completed, & .Mui-active': {
      border: 'none',
      fill: '#000000',
    },
    '& .MuiStepIcon-text': {
      fontFamily: 'var(--font-serif) !important',
      fontSize: 24,
      fontWeight: 100,
      marginTop: '-4px !important',
    }
  }
}))

export function BuilderStepper() {
  const pathname = usePathname();
  const classes = useStyles();
  const isSecondStep = pathname.includes('charms');
  const isLastStep = pathname.includes('order');
  const currentStep = isSecondStep ? 2 : (isLastStep ? 3 : 1);

  return (
    <Stepper nonLinear activeStep={currentStep} className={classes.customStepper}>
      {steps.map(({ href, label }, index) => {
        const stepNumber = index + 1;
        const isCurrent = currentStep === stepNumber;
        const isPast = currentStep > stepNumber;
        return <Step key={index} completed={pathname.includes(href)}>
          <Box
            className={`flex items-center gap-1.5 ${index + 1 > currentStep + 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            <div
              className={`flex font-[100] font-serif h-11 w-11 items-center justify-center rounded-full border text-[40px] ${isCurrent || isPast
                ? "border-black bg-black text-white"
                : "border-black text-black"
                }`}
            >
              <span className={`-mt-2 ${index + 1 === 3 ? '-mt-4' : ''}`}>{index + 1}</span>
            </div>
            <Typography
              component="span"
              sx={{
                textTransform: "lowercase",
                fontSize: { xs: "18px", md: "24px" },
                color: "#000000",
                fontWeight: 100,
              }}
            >
              {label}
            </Typography>
          </Box>
        </Step>
      })}
    </Stepper>
  );
}

