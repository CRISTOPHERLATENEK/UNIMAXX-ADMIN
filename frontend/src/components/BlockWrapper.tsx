type Props = {
    style?: string
    children: React.ReactNode
}

export function BlockWrapper({ style = "none", children }: Props) {
    return (
        <section className={`block block-${style}`}>
            <div className="content">
                {children}
            </div>
        </section>
    )
}