import React from 'react';

import { P } from '@trezor/components';

import { Translation, Image } from '@suite-components';

interface Props {
    error?: string;
}

const Error = ({ error }: Props) => (
    <>
        <P size="small">
            <Translation id="TR_RECOVERY_ERROR" values={{ error }} />
        </P>
        <Image image="UNI_ERROR" />
    </>
);

export default Error;
