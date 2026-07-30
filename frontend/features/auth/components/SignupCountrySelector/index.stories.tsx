import type { Meta, StoryObj } from "@storybook/react";
import { SignupCountrySelector } from "./index";

const meta: Meta<typeof SignupCountrySelector> = {
  title: "Features/Auth/SignupCountrySelector",
  component: SignupCountrySelector,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SignupCountrySelector>;

export const Default: Story = {};