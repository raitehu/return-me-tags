import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../app/page';
import * as htmlToImage from 'html-to-image';

const toPngMock = htmlToImage.toPng as jest.MockedFunction<typeof htmlToImage.toPng>;

const getFirstTag = () => {
  const previewSection = screen.getByRole('heading', { name: 'Preview!' }).closest('section');
  expect(previewSection).not.toBeNull();
  const previewRegion = within(previewSection!);
  const tags = previewRegion.getAllByTestId('tag-item');
  expect(tags.length).toBeGreaterThan(0);
  return { previewRegion, firstTag: within(tags[0]), firstTagElement: tags[0] };
};

describe('HomePage', () => {
  beforeEach(() => {
    toPngMock.mockClear();
  });

  it('keeps preview hidden until required fields are provided', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    expect(screen.getByAltText('ReturnMeTags!')).toBeInTheDocument();
    expect(screen.getByText('名前と連絡先URLを入力するとここにプレビューが表示されます。')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('名前');
    const contactInput = screen.getByLabelText('連絡先URL(SNSなど)');

    await act(async () => {
      await user.type(nameInput, '佐藤花子');
      await user.type(contactInput, 'https://example.com/contact');
    });

    await waitFor(() => {
      const message = screen.queryByText('名前と連絡先URLを入力するとここにプレビューが表示されます。');
      expect(message).toBeNull();
      expect(screen.getAllByTestId('tag-item').length).toBeGreaterThan(0);
    });
  });

  it('updates tag appearance based on user input', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const nameInput = screen.getByLabelText('名前');
    const contactInput = screen.getByLabelText('連絡先URL(SNSなど)');

    await act(async () => {
      await user.type(nameInput, '山田太郎');
      await user.type(contactInput, 'https://contact.example/123');
    });

    const { firstTag, firstTagElement } = getFirstTag();

    await waitFor(() => {
      expect(firstTag.getByText('山田太郎', { selector: 'p.tagName' })).toBeInTheDocument();
      expect(firstTag.getByText('連絡先はこちら', { selector: 'p.tagLabel' })).toBeInTheDocument();
      expect(firstTag.getByTestId('mock-qr-code')).toHaveTextContent('https://contact.example/123');
    });

    const colorInput = screen.getByLabelText('カラー');
    await act(async () => {
      fireEvent.input(colorInput, { target: { value: '#ff0000' } });
    });

    await waitFor(() => {
      const content = firstTagElement.querySelector('.tagContent');
      expect(content).not.toBeNull();
      expect(content).toHaveStyle({ color: '#ff0000' });
    });

    const fontSelect = screen.getByLabelText('文字フォント');
    await act(async () => {
      await user.selectOptions(fontSelect, 'メイリオ');
    });

    await waitFor(() => {
      expect(fontSelect).toHaveValue('メイリオ');
    });
  });

  it('blocks download until required fields are present', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const button = screen.getByRole('button', { name: 'PNGをダウンロード' });

    await act(async () => {
      await user.click(button);
    });

    expect(toPngMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('先に名前と連絡先URLを入力してください。');

    const nameInput = screen.getByLabelText('名前');
    const contactInput = screen.getByLabelText('連絡先URL(SNSなど)');

    await act(async () => {
      await user.type(nameInput, '田中一郎');
      await user.type(contactInput, 'https://example.org/info');
    });

    await act(async () => {
      await user.click(button);
    });

    await waitFor(() => {
      expect(toPngMock).toHaveBeenCalled();
    });
  });
});
