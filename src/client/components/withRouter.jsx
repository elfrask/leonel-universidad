import { useNavigate, useParams, useLocation, useMatch } from 'react-router-dom';

function withRouter(Component, withMatch) {
    function WrapperComponent(props) {
        const navigate = useNavigate();
        const params = useParams();
        const location = useLocation();
        let match = {};
        
        if (withMatch) {
            
            match = useMatch();
        }


        return (
            <Component
                {...props}
                navigate={navigate}
                params={params}
                location={location}
                match={match}
            />
        );
    }

    return WrapperComponent;
}

export default withRouter;
