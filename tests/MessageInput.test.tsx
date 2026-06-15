import { render } from "@testing-library/react-native";
import MessageInput from "../components/chat/MessageInput";

describe("MessageInput", () => {
  it("renders correctly", () => {
    const { getByPlaceholderText } = render(<MessageInput />);
    expect(getByPlaceholderText(/message/i)).toBeTruthy();
  });
});
