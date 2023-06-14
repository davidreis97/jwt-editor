import { createStyles, getSize, rem } from "@mantine/core";

export default createStyles((theme, _params, { size }) => ({
    input: {
      fontFamily: theme.fontFamilyMonospace,
      fontSize: `calc(${getSize({ size, sizes: theme.fontSizes })} - ${rem(2)})`,
    },
}));