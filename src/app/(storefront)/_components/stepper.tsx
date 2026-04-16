"use client";

import { Box, Step, Stepper, Typography } from "@mui/material";
import { Theme } from "@mui/material/styles";
import { makeStyles } from "@mui/styles";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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

    "& .MuiStep-root": {
      padding: 0,
    },
    "& .MuiButtonBase-root": {
      padding: 16,
    },
    "& .MuiSvgIcon-root": {
      width: "44px",
      height: "44px",
      border: "1px solid #000000",
      borderRadius: "50%",
      fill: "#ffffff",
      color: "#000000 !important",
    },
    "& .Mui-completed, & .Mui-active": {
      border: "none",
      fill: "#000000",
    },
    "& .MuiStepIcon-text": {
      fontFamily: "var(--font-serif) !important",
      fontSize: 24,
      fontWeight: 100,
      marginTop: "-4px !important",
    },
  },
}));

function StepItem({
  index,
  currentStep,
  isCurrent,
  isPast,
  label,
}: {
  index: number;
  currentStep: number;
  isCurrent: boolean;
  isPast: boolean;
  label: string;
}) {
  return (
    <Box
      className={`flex items-center gap-1.5 ${index + 1 > currentStep + 1 ? "pointer-events-none opacity-50" : ""}`}
    >
      <div
        className={`flex font-[100] font-serif w-12 h-12 sm:h-11 sm:w-11 items-center justify-center rounded-full border text-[40px] ${isCurrent || isPast
          ? "border-black bg-black text-white"
          : "border-black text-black"
          }`}
      >
        <span className={`-mt-2 ${index + 1 === 3 ? "-mt-4" : ""}`}>
          {index + 1}
        </span>
      </div>
      <Box display={'flex'} flexDirection={'column'} ml={1}>
        <div className="sm:hidden">
          <Typography
            component="span"
            sx={{
              textTransform: "lowercase",
              fontSize: { xs: "16px", md: "24px" },
              color: "#8e8e8e",
              fontWeight: 300,
            }}
          >Step {currentStep}/3</Typography>
        </div>
        <Typography
          component="span"
          sx={{
            textTransform: "lowercase",
            fontSize: { xs: "20px", md: "24px" },
            color: "#000000",
            fontWeight: 100,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export function BuilderStepper() {
  const pathname = usePathname();
  const classes = useStyles();
  const isSecondStep = pathname.includes("charms");
  const isLastStep = pathname.includes("order");
  const currentStep = isSecondStep ? 2 : isLastStep ? 3 : 1;
  const backUrl = isSecondStep ? '/custom-case' : (isLastStep ? '/custom-case/charms' : '/');

  return (
    <>
      <div className="hidden sm:block">
        <Stepper
          nonLinear
          activeStep={currentStep}
          className={classes.customStepper}
        >
          {steps.map(({ href, label }, index) => {
            const stepNumber = index + 1;
            const isCurrent = currentStep === stepNumber;
            const isPast = currentStep > stepNumber;
            return (
              <Step
                key={index}
                completed={pathname.includes(href)}
              >
                <StepItem
                  currentStep={currentStep}
                  index={index}
                  isCurrent={isCurrent}
                  isPast={isPast}
                  label={label}
                  key={index}
                />
              </Step>
            );
          })}
        </Stepper>
      </div>
      <div className="flex items-center justify-between sm:hidden">
        <StepItem
          currentStep={currentStep}
          index={currentStep - 1}
          isCurrent={true}
          isPast={false}
          label={steps[currentStep - 1].label}
        />
        <Link
          href={backUrl}
          className="flex items-center gap-1 text-[16px] max-[348px]:hidden"
        >
          <ArrowLeft size={13} />
          Back
        </Link>
      </div>
    </>
  );
}
