import { FC } from 'react';

type Props = {
  value: string;
  size?: number;
};

export const QRCodeCanvas: FC<Props> = ({ value }) => {
  return <div data-testid="mock-qr-code">{value}</div>;
};

export default QRCodeCanvas;
